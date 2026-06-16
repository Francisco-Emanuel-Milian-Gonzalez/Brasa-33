import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useOrdersStore } from '../store/useOrdersStore.js';
import { useSaveOrder } from '../hooks/useSaveOrder.jsx';
import { showSuccess, showError } from '../../../shared/utils/toast.js';

export const OrderModal = ({ isOpen, onClose, order }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const { saveOrder } = useSaveOrder();
  const loading = useOrdersStore((state) => state.loading);

  useEffect(() => {
    if (isOpen) {
      if (order) {
        reset({
          name: order?.name || '',
          card: '',
          expiry: '',
          cvv: '',
        });
      } else {
        reset({
          name: '',
          card: '',
          expiry: '',
          cvv: '',
        });
      }
    }
  }, [isOpen, order, reset]);

  const onSubmit = async (formData) => {
    try {
      await saveOrder(formData, order?.id);

      showSuccess('Pago procesado exitosamente');

      reset();
      onClose();
    } catch (err) {
      showError('Error al procesar el pago');
    }
  };

  if (!isOpen) return null;

  const data = order?.items ? order : { items: [], total: 0 };

  const subtotal = data.total || 0;
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-50 px-4"
      style={{ background: "rgba(13,13,13,0.85)" }}
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-5xl rounded-2xl flex gap-6 p-6 relative"
        style={{ background: "#1A1A1A" }}
      >
  
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-2xl"
        >
          ×
        </button>

        {/* ================= LEFT ================= */}
        <div
          className="flex-1 rounded-xl p-5 border"
          style={{ borderColor: "#333333" }}
        >
          <h2 className="text-lg font-semibold mb-4 text-[#F2F2F2]">
            Resumen de la Orden
          </h2>

          {data.items.length === 0 ? (
            <p style={{ color: "#A6A6A6" }}>No hay items en la orden.</p>
          ) : (
            <>
              <div className="space-y-4">
                {data.items.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <div>
                      <p className="text-[#F2F2F2]">{item.name}</p>
                      <p className="text-sm text-[#A6A6A6]">
                        x{item.quantity}
                      </p>
                    </div>
                    <p className="text-[#F2F2F2]">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t pt-4 space-y-2 border-[#333333]">
                <div className="flex justify-between text-sm text-[#A6A6A6]">
                  <span>Subtotal</span>
                  <span className="text-[#F2F2F2]">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-sm text-[#A6A6A6]">
                  <span>Tax (10%)</span>
                  <span className="text-[#F2F2F2]">
                    ${tax.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-lg font-semibold text-[#F2F2F2]">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 rounded-xl p-5 border space-y-4"
          style={{ borderColor: "#333333" }}
        >
          <h2 className="text-lg font-semibold text-[#F2F2F2]">
            Información de Pago
          </h2>

          <div>
            <label className="text-sm text-[#A6A6A6]">
              Nombre en la tarjeta
            </label>
            <input
              {...register("name", { required: true })}
              className="w-full mt-1 px-3 py-2 rounded-lg"
              style={{
                background: "#333333",
                color: "#F2F2F2",
              }}
            />
          </div>

          <div>
            <label className="text-sm text-[#A6A6A6]">
              Número de tarjeta
            </label>
            <input
              {...register("card", { required: true })}
              className="w-full mt-1 px-3 py-2 rounded-lg"
              style={{ background: "#333333", color: "#F2F2F2" }}
            />
          </div>

          <div className="flex gap-3">
            <input
              {...register("expiry", { required: true })}
              placeholder="MM/AA"
              className="w-1/2 px-3 py-2 rounded-lg"
              style={{ background: "#333333", color: "#F2F2F2" }}
            />
            <input
              {...register("cvv", { required: true })}
              placeholder="CVV"
              className="w-1/2 px-3 py-2 rounded-lg"
              style={{ background: "#333333", color: "#F2F2F2" }}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg font-semibold"
            style={{
              background: "#F2F2F2",
              color: "#0D0D0D",
            }}
          >
            Pagar ${total.toFixed(2)}
          </button>

          <p className="text-xs text-center text-[#A6A6A6]">
            Pago seguro y encriptado
          </p>
        </form>
      </div>
    </div>
  );
};