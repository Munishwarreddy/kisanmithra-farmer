const cron = require('node-cron');
const Contract = require('../models/ContractModel');
const Order = require('../models/OrderModel');
const Notification = require('../models/NotificationModel');

/**
 * Create an order from a contract delivery
 */
const createContractOrder = async (contract, delivery) => {
  try {
    // Populate contract details
    await contract.populate('product');
    await contract.populate('initiator', 'name email role');
    await contract.populate('recipient', 'name email role');

    const product = contract.product;

    // Determine consumer and farmer based on roles
    const consumer = contract.initiator.role === 'consumer' ? contract.initiator : contract.recipient;
    const farmer = contract.initiator.role === 'farmer' ? contract.initiator : contract.recipient;

    // Create order
    const order = await Order.create({
      consumer: consumer._id,
      farmer: farmer._id,
      items: [{
        product: product._id,
        name: product.name,
        quantity: delivery.quantity,
        price: contract.pricePerUnit,
        unit: contract.unit,
      }],
      subtotal: contract.pricePerUnit * delivery.quantity,
      deliveryFee: 0,
      tax: 0,
      totalAmount: contract.pricePerUnit * delivery.quantity,
      status: 'placed',
      paymentMethod: 'contract', // Special payment method for contract orders
      paymentStatus: 'pending',
      deliveryAddress: consumer.address || {
        name: consumer.name,
        phone: consumer.phone || '',
        street: '',
        city: '',
        state: '',
        pincode: '',
      },
      isContractOrder: true,
      contractId: contract._id,
    });

    // Update delivery with order ID and mark as completed
    delivery.orderId = order._id;
    delivery.status = 'completed';
    await contract.save();

    // Create notifications for both parties
    await Notification.create({
      user: consumer._id,
      type: 'contract',
      title: 'Contract Delivery Order Created',
      message: `A delivery order for ${product.name} has been created as part of your contract ${contract.contractNumber}.`,
      link: `/orders/${order._id}`,
      metadata: {
        orderId: order._id,
        contractId: contract._id,
        contractNumber: contract.contractNumber,
        productName: product.name,
      },
    });

    await Notification.create({
      user: farmer._id,
      type: 'contract',
      title: 'Contract Delivery Order Created',
      message: `A delivery order for ${product.name} has been created as part of contract ${contract.contractNumber}.`,
      link: `/orders/${order._id}`,
      metadata: {
        orderId: order._id,
        contractId: contract._id,
        contractNumber: contract.contractNumber,
        productName: product.name,
      },
    });

    console.log(`✅ Created contract order ${order.orderNumber} for contract ${contract.contractNumber}`);
    return order;
  } catch (error) {
    console.error(`❌ Error creating contract order for ${contract.contractNumber}:`, error);
    throw error;
  }
};

/**
 * Process contracts with deliveries due today
 */
const processContractDeliveries = async () => {
  try {
    console.log('🔄 Processing contract deliveries...');

    // Find active contracts
    const activeContracts = await Contract.find({
      status: 'active',
    });

    console.log(`📦 Found ${activeContracts.length} active contracts to check`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    let processedCount = 0;

    for (const contract of activeContracts) {
      // Find deliveries scheduled for today that are still pending
      const dueTodayDeliveries = contract.deliveries.filter(delivery => {
        const scheduledDate = new Date(delivery.scheduledDate);
        scheduledDate.setHours(0, 0, 0, 0);
        return delivery.status === 'pending' && 
               scheduledDate >= today && 
               scheduledDate <= todayEnd;
      });

      if (dueTodayDeliveries.length > 0) {
        console.log(`📋 Contract ${contract.contractNumber} has ${dueTodayDeliveries.length} deliveries due today`);

        for (const delivery of dueTodayDeliveries) {
          try {
            await createContractOrder(contract, delivery);
            processedCount++;
          } catch (error) {
            console.error(`❌ Failed to process delivery for contract ${contract.contractNumber}:`, error);
            // Continue processing other deliveries even if one fails
          }
        }
      }
    }

    console.log(`✅ Contract delivery processing completed. Processed ${processedCount} deliveries.`);
  } catch (error) {
    console.error('❌ Error processing contract deliveries:', error);
  }
};

/**
 * Check and update contract completion status
 */
const updateContractCompletionStatus = async () => {
  try {
    console.log('🔄 Checking contract completion status...');

    // Find active contracts
    const activeContracts = await Contract.find({
      status: 'active',
    });

    console.log(`📋 Found ${activeContracts.length} active contracts to check`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let completedCount = 0;

    for (const contract of activeContracts) {
      // Check if contract end date has passed
      const endDate = new Date(contract.endDate);
      endDate.setHours(0, 0, 0, 0);

      if (endDate < today) {
        // Check if all deliveries are completed
        const allDeliveriesCompleted = contract.deliveries.every(
          delivery => delivery.status === 'completed'
        );

        if (allDeliveriesCompleted) {
          // Update contract status to completed (Requirement 8.8)
          contract.status = 'completed';
          await contract.save();

          // Populate for notifications
          await contract.populate('product', 'name');
          await contract.populate('initiator', 'name email role');
          await contract.populate('recipient', 'name email role');

          // Notify both parties
          const consumer = contract.initiator.role === 'consumer' ? contract.initiator : contract.recipient;
          const farmer = contract.initiator.role === 'farmer' ? contract.initiator : contract.recipient;

          await Notification.create({
            user: consumer._id,
            type: 'contract',
            title: 'Contract Completed',
            message: `Your contract ${contract.contractNumber} for ${contract.product.name} has been completed successfully.`,
            link: `/contracts/${contract._id}`,
            metadata: {
              contractId: contract._id,
              contractNumber: contract.contractNumber,
              productName: contract.product.name,
            },
          });

          await Notification.create({
            user: farmer._id,
            type: 'contract',
            title: 'Contract Completed',
            message: `Contract ${contract.contractNumber} for ${contract.product.name} has been completed successfully.`,
            link: `/contracts/${contract._id}`,
            metadata: {
              contractId: contract._id,
              contractNumber: contract.contractNumber,
              productName: contract.product.name,
            },
          });

          completedCount++;
          console.log(`✅ Marked contract ${contract.contractNumber} as completed`);
        }
      }
    }

    console.log(`✅ Contract completion check completed. Marked ${completedCount} contracts as completed.`);
  } catch (error) {
    console.error('❌ Error updating contract completion status:', error);
  }
};

/**
 * Initialize contract automation
 */
const initializeContractAutomation = () => {
  console.log('🚀 Initializing contract automation...');

  // Run contract delivery processing daily at 6:30 AM
  cron.schedule('30 6 * * *', async () => {
    console.log('⏰ Running scheduled contract delivery processing at 6:30 AM');
    await processContractDeliveries();
  });

  // Run contract completion check daily at 7:00 AM
  cron.schedule('0 7 * * *', async () => {
    console.log('⏰ Running scheduled contract completion check at 7:00 AM');
    await updateContractCompletionStatus();
  });

  console.log('✅ Contract automation initialized');
  console.log('📅 Scheduled jobs:');
  console.log('   - Contract delivery processing: Daily at 6:30 AM');
  console.log('   - Contract completion check: Daily at 7:00 AM');

  // For development/testing: Run immediately on startup
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Development mode: Running initial contract checks...');
    setTimeout(async () => {
      await processContractDeliveries();
      await updateContractCompletionStatus();
    }, 5000); // Wait 5 seconds after startup
  }
};

module.exports = {
  initializeContractAutomation,
  processContractDeliveries,
  updateContractCompletionStatus,
  createContractOrder,
};
