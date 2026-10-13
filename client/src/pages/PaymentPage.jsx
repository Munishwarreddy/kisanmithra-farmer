import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { FaArrowLeft, FaLock } from "react-icons/fa";
import Loader from "../components/Loader";
import { getOrderDetails } from "../redux/slices/orderSlice";
import { getApiBaseUrl } from "../utils/apiUrl";

const API_URL = getApiBaseUrl();
const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

const PaymentForm = ({ order, clientSecret, paymentIntentId, token }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const verifyPayment = async (intentId) => {
    try {
      await axios.post(
        `${API_URL}/payments/success`,
        { paymentIntentId: intentId, orderId: order._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/orders/${order._id}`, { replace: true });
    } catch {
      setError("Payment succeeded. We’re confirming it with the payment provider; please don’t pay again.");
      setSubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements || submitting) return;

    setSubmitting(true);
    setError("");
    const { error: validationError } = await elements.submit();
    if (validationError) {
      setError(validationError.message || "Check your payment details and try again.");
      setSubmitting(false);
      return;
    }

    const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/payment/${order._id}`,
      },
      redirect: "if_required",
    });

    if (paymentError) {
      setError(paymentError.message || "Payment could not be completed. Try another payment method.");
      setSubmitting(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      await verifyPayment(paymentIntent.id || paymentIntentId);
      return;
    }

    setError("Your payment is still processing. The order will update when the provider confirms it.");
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-lg border border-gray-200 p-4">
        <PaymentElement />
      </div>
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Processing payment..." : `Pay ₨${Number(order.totalAmount).toFixed(2)}`}
      </button>
      <p className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <FaLock /> Payment details are encrypted and handled by Stripe.
      </p>
    </form>
  );
};

const PaymentPage = () => {
  const { id: orderId } = useParams();
  const dispatch = useDispatch();
  const [order, setOrder] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    let cancelled = false;
    const loadOrderAndIntent = async () => {
      try {
        const result = await dispatch(getOrderDetails(orderId)).unwrap();
        const currentOrder = result.data;
        if (cancelled) return;
        setOrder(currentOrder);

        if (currentOrder.paymentStatus === "completed") {
          window.location.replace(`/orders/${orderId}`);
          return;
        }
        if (currentOrder.paymentMethod !== "card") {
          setError("This order was not placed with online card payment.");
          return;
        }
        if (!publishableKey) {
          setError("Online payments are not configured. Add the Stripe publishable key to the client environment and try again.");
          return;
        }

        const { data } = await axios.post(
          `${API_URL}/payments/create-intent`,
          { orderId: currentOrder._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (cancelled) return;
        if (data.data.alreadyPaid) {
          window.location.replace(`/orders/${orderId}`);
          return;
        }
        setClientSecret(data.data.clientSecret);
        setPaymentIntentId(data.data.paymentIntentId);
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError.response?.data?.message ||
              requestError.message ||
              "Could not start online payment."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadOrderAndIntent();
    return () => { cancelled = true; };
  }, [dispatch, orderId, token]);

  if (loading) return <Loader />;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Link to={`/orders/${orderId}`} className="mb-6 inline-flex items-center text-green-600 hover:text-green-700">
        <FaArrowLeft className="mr-2" /> Back to order
      </Link>
      <div className="glass rounded-xl p-6 sm:p-8">
        <h1 className="mb-2 text-3xl font-bold">Secure payment</h1>
        <p className="mb-6 text-gray-600">
          Order #{orderId.slice(-8)}{order && ` · ₨${Number(order.totalAmount).toFixed(2)}`}
        </p>
        {error ? (
          <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900">
            <p>{error}</p>
            <Link to={`/orders/${orderId}`} className="mt-3 inline-block font-medium underline">
              View order
            </Link>
          </div>
        ) : clientSecret && stripePromise && order ? (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret, appearance: { theme: "stripe" } }}
          >
            <PaymentForm
              order={order}
              clientSecret={clientSecret}
              paymentIntentId={paymentIntentId}
              token={token}
            />
          </Elements>
        ) : null}
      </div>
    </div>
  );
};

export default PaymentPage;
