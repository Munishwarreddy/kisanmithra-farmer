const Contract = require("../models/ContractModel");
const Product = require("../models/ProductModel");
const User = require("../models/UserModel");
const Notification = require("../models/NotificationModel");

/**
 * @desc    Create a new contract
 * @route   POST /api/contracts
 * @access  Private (Consumer or Farmer)
 */
const createContract = async (req, res) => {
  try {
    const {
      recipientId,
      productId,
      quantity,
      pricePerUnit,
      duration,
      startDate,
      deliverySchedule,
      terms,
    } = req.body;

    // Validate required fields
    if (!recipientId || !productId || !quantity || !pricePerUnit || !duration || !startDate || !deliverySchedule || !terms) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Verify recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: "Recipient not found",
      });
    }

    // Verify initiator and recipient are different
    if (req.user._id.toString() === recipientId) {
      return res.status(400).json({
        success: false,
        message: "Cannot create contract with yourself",
      });
    }

    // Verify initiator and recipient have different roles (one farmer, one consumer)
    if (req.user.role === recipient.role) {
      return res.status(400).json({
        success: false,
        message: "Contract must be between a farmer and a consumer",
      });
    }

    // Verify product exists
    const product = await Product.findById(productId).populate("farmer");
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Calculate total value
    const totalValue = quantity * pricePerUnit;

    // Calculate end date based on duration (in months)
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + duration);

    // Generate delivery schedule array based on deliverySchedule type
    const deliveries = [];
    if (deliverySchedule === 'weekly' || deliverySchedule === 'monthly') {
      let currentDate = new Date(start);
      const deliveryQuantity = deliverySchedule === 'weekly' 
        ? Math.ceil(quantity / (duration * 4)) // Approximate weeks per month
        : Math.ceil(quantity / duration); // Deliveries per month

      while (currentDate < end) {
        deliveries.push({
          scheduledDate: new Date(currentDate),
          quantity: deliveryQuantity,
          status: 'pending',
        });

        if (deliverySchedule === 'weekly') {
          currentDate.setDate(currentDate.getDate() + 7);
        } else {
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
      }
    }
    // For 'on-demand', deliveries will be added manually

    // Create contract
    const contract = await Contract.create({
      initiator: req.user._id,
      recipient: recipientId,
      product: productId,
      quantity,
      unit: product.unit || 'kg',
      pricePerUnit,
      totalValue,
      duration,
      startDate: start,
      endDate: end,
      deliverySchedule,
      terms,
      status: 'pending',
      deliveries,
    });

    // Populate contract details
    const populatedContract = await Contract.findById(contract._id)
      .populate('product', 'name price image')
      .populate('initiator', 'name email role')
      .populate('recipient', 'name email role');

    // Create notification for recipient (Requirement 8.2)
    await Notification.create({
      user: recipientId,
      type: 'contract',
      title: 'New Contract Proposal',
      message: `${req.user.name} has proposed a contract for ${product.name}. Please review and respond.`,
      link: `/contracts/${contract._id}`,
      metadata: {
        contractId: contract._id,
        contractNumber: contract.contractNumber,
        initiatorName: req.user.name,
        productName: product.name,
      },
    });

    res.status(201).json({
      success: true,
      message: "Contract created successfully",
      data: populatedContract,
    });
  } catch (error) {
    console.error("Error creating contract:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create contract",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all contracts for the logged-in user
 * @route   GET /api/contracts
 * @access  Private
 */
const getUserContracts = async (req, res) => {
  try {
    // Find contracts where user is either initiator or recipient
    const contracts = await Contract.find({
      $or: [
        { initiator: req.user._id },
        { recipient: req.user._id },
      ],
    })
      .populate('product', 'name price image')
      .populate('initiator', 'name email role')
      .populate('recipient', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: contracts.length,
      data: contracts,
    });
  } catch (error) {
    console.error("Error fetching contracts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contracts",
      error: error.message,
    });
  }
};

/**
 * @desc    Get a single contract by ID
 * @route   GET /api/contracts/:id
 * @access  Private
 */
const getContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('product', 'name price image description unit')
      .populate('initiator', 'name email phone role')
      .populate('recipient', 'name email phone role')
      .populate('deliveries.orderId', 'orderNumber status totalAmount');

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: "Contract not found",
      });
    }

    // Verify user has access to this contract
    const userId = req.user._id.toString();
    const initiatorId = contract.initiator._id.toString();
    const recipientId = contract.recipient._id.toString();

    if (userId !== initiatorId && userId !== recipientId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this contract",
      });
    }

    res.status(200).json({
      success: true,
      data: contract,
    });
  } catch (error) {
    console.error("Error fetching contract:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contract",
      error: error.message,
    });
  }
};

/**
 * @desc    Accept a contract
 * @route   PUT /api/contracts/:id/accept
 * @access  Private (Recipient only)
 */
const acceptContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('product', 'name')
      .populate('initiator', 'name')
      .populate('recipient', 'name');

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: "Contract not found",
      });
    }

    // Verify user is the recipient
    if (contract.recipient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the recipient can accept this contract",
      });
    }

    // Check if contract is in pending status
    if (contract.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot accept contract with status: ${contract.status}`,
      });
    }

    // Update contract status to active (Requirement 8.4)
    contract.status = 'active';
    await contract.save();

    // Create notification for initiator
    await Notification.create({
      user: contract.initiator._id,
      type: 'contract',
      title: 'Contract Accepted',
      message: `${contract.recipient.name} has accepted your contract proposal for ${contract.product.name}.`,
      link: `/contracts/${contract._id}`,
      metadata: {
        contractId: contract._id,
        contractNumber: contract.contractNumber,
        recipientName: contract.recipient.name,
        productName: contract.product.name,
      },
    });

    const populatedContract = await Contract.findById(contract._id)
      .populate('product', 'name price image')
      .populate('initiator', 'name email role')
      .populate('recipient', 'name email role');

    res.status(200).json({
      success: true,
      message: "Contract accepted successfully",
      data: populatedContract,
    });
  } catch (error) {
    console.error("Error accepting contract:", error);
    res.status(500).json({
      success: false,
      message: "Failed to accept contract",
      error: error.message,
    });
  }
};

/**
 * @desc    Reject a contract
 * @route   PUT /api/contracts/:id/reject
 * @access  Private (Recipient only)
 */
const rejectContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('product', 'name')
      .populate('initiator', 'name')
      .populate('recipient', 'name');

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: "Contract not found",
      });
    }

    // Verify user is the recipient
    if (contract.recipient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the recipient can reject this contract",
      });
    }

    // Check if contract is in pending status
    if (contract.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject contract with status: ${contract.status}`,
      });
    }

    // Update contract status to rejected
    contract.status = 'rejected';
    await contract.save();

    // Create notification for initiator
    await Notification.create({
      user: contract.initiator._id,
      type: 'contract',
      title: 'Contract Rejected',
      message: `${contract.recipient.name} has rejected your contract proposal for ${contract.product.name}.`,
      link: `/contracts/${contract._id}`,
      metadata: {
        contractId: contract._id,
        contractNumber: contract.contractNumber,
        recipientName: contract.recipient.name,
        productName: contract.product.name,
      },
    });

    const populatedContract = await Contract.findById(contract._id)
      .populate('product', 'name price image')
      .populate('initiator', 'name email role')
      .populate('recipient', 'name email role');

    res.status(200).json({
      success: true,
      message: "Contract rejected successfully",
      data: populatedContract,
    });
  } catch (error) {
    console.error("Error rejecting contract:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject contract",
      error: error.message,
    });
  }
};

/**
 * @desc    Propose modifications to a contract
 * @route   PUT /api/contracts/:id/modify
 * @access  Private (Recipient only)
 */
const modifyContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('product', 'name unit')
      .populate('initiator', 'name')
      .populate('recipient', 'name');

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: "Contract not found",
      });
    }

    // Verify user is the recipient
    if (contract.recipient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the recipient can propose modifications",
      });
    }

    // Check if contract is in pending status
    if (contract.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot modify contract with status: ${contract.status}`,
      });
    }

    // Allow updating certain fields
    const allowedUpdates = ['quantity', 'pricePerUnit', 'duration', 'startDate', 'deliverySchedule', 'terms'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Recalculate dependent fields if necessary
    if (updates.quantity || updates.pricePerUnit) {
      const newQuantity = updates.quantity || contract.quantity;
      const newPricePerUnit = updates.pricePerUnit || contract.pricePerUnit;
      updates.totalValue = newQuantity * newPricePerUnit;
    }

    if (updates.startDate || updates.duration) {
      const newStartDate = updates.startDate ? new Date(updates.startDate) : contract.startDate;
      const newDuration = updates.duration || contract.duration;
      const newEndDate = new Date(newStartDate);
      newEndDate.setMonth(newEndDate.getMonth() + newDuration);
      updates.endDate = newEndDate;
    }

    // Regenerate deliveries if schedule or dates changed
    if (updates.deliverySchedule || updates.startDate || updates.duration || updates.quantity) {
      const schedule = updates.deliverySchedule || contract.deliverySchedule;
      const start = updates.startDate ? new Date(updates.startDate) : contract.startDate;
      const end = updates.endDate || contract.endDate;
      const qty = updates.quantity || contract.quantity;
      const dur = updates.duration || contract.duration;

      const deliveries = [];
      if (schedule === 'weekly' || schedule === 'monthly') {
        let currentDate = new Date(start);
        const deliveryQuantity = schedule === 'weekly' 
          ? Math.ceil(qty / (dur * 4))
          : Math.ceil(qty / dur);

        while (currentDate < end) {
          deliveries.push({
            scheduledDate: new Date(currentDate),
            quantity: deliveryQuantity,
            status: 'pending',
          });

          if (schedule === 'weekly') {
            currentDate.setDate(currentDate.getDate() + 7);
          } else {
            currentDate.setMonth(currentDate.getMonth() + 1);
          }
        }
      }
      updates.deliveries = deliveries;
    }

    const updatedContract = await Contract.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('product', 'name price image')
      .populate('initiator', 'name email role')
      .populate('recipient', 'name email role');

    // Create notification for initiator
    await Notification.create({
      user: contract.initiator._id,
      type: 'contract',
      title: 'Contract Modification Proposed',
      message: `${contract.recipient.name} has proposed modifications to the contract for ${contract.product.name}. Please review.`,
      link: `/contracts/${contract._id}`,
      metadata: {
        contractId: contract._id,
        contractNumber: contract.contractNumber,
        recipientName: contract.recipient.name,
        productName: contract.product.name,
      },
    });

    res.status(200).json({
      success: true,
      message: "Contract modifications proposed successfully",
      data: updatedContract,
    });
  } catch (error) {
    console.error("Error modifying contract:", error);
    res.status(500).json({
      success: false,
      message: "Failed to modify contract",
      error: error.message,
    });
  }
};

/**
 * @desc    Cancel a contract
 * @route   DELETE /api/contracts/:id
 * @access  Private (Initiator or Recipient)
 */
const cancelContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('product', 'name')
      .populate('initiator', 'name')
      .populate('recipient', 'name');

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: "Contract not found",
      });
    }

    // Verify user is either initiator or recipient
    const userId = req.user._id.toString();
    const initiatorId = contract.initiator._id.toString();
    const recipientId = contract.recipient._id.toString();

    if (userId !== initiatorId && userId !== recipientId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this contract",
      });
    }

    // Check if contract can be cancelled
    if (contract.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: "Contract is already cancelled",
      });
    }

    if (contract.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a completed contract",
      });
    }

    // Update contract status to cancelled
    contract.status = 'cancelled';
    await contract.save();

    // Determine the other party
    const otherPartyId = userId === initiatorId ? recipientId : initiatorId;
    const otherPartyName = userId === initiatorId ? contract.recipient.name : contract.initiator.name;

    // Create notification for the other party
    await Notification.create({
      user: otherPartyId,
      type: 'contract',
      title: 'Contract Cancelled',
      message: `${req.user.name} has cancelled the contract for ${contract.product.name}.`,
      link: `/contracts/${contract._id}`,
      metadata: {
        contractId: contract._id,
        contractNumber: contract.contractNumber,
        cancelledBy: req.user.name,
        productName: contract.product.name,
      },
    });

    res.status(200).json({
      success: true,
      message: "Contract cancelled successfully",
      data: contract,
    });
  } catch (error) {
    console.error("Error cancelling contract:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel contract",
      error: error.message,
    });
  }
};

module.exports = {
  createContract,
  getUserContracts,
  getContract,
  acceptContract,
  rejectContract,
  modifyContract,
  cancelContract,
};
