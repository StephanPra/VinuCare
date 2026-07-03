import { useContext } from 'react';
import { ShopContext } from './ShopContext';

export default function CartPage({ onNavigate, isLoggedIn }) {
  const { cart, products, changeQty, removeFromCart, clearCart, getTotal, getTotalItems } = useContext(ShopContext);

  const total = getTotal();
  const totalItems = getTotalItems();
  const itemIds = Object.keys(cart).filter(id => cart[id] > 0);

  const handleCheckout = () => {
    if (!isLoggedIn) {
      onNavigate('login');
    } else {
      alert(`🎉 Order placed! Total: $${(total + 3.99).toFixed(2)}\nThank you for shopping at VinuCare! 🐾`);
      clearCart();
    }
  };

  return (
    <div className="page active" style={{ padding: '40px max(20px, (100% - 1200px)/2)', minHeight: '80vh' }}>

      <div className="cart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '15px' }}>
        <h3 style={{ margin: 0, fontSize: '1.8rem' }}>🛒 Your Shopping Cart</h3>
        <span className="cart-count-pill">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
      </div>

      <div className="cart-page-wrapper" style={{ display: 'grid', gridTemplateColumns: itemIds.length > 0 ? '2fr 1fr' : '1fr', gap: '30px', alignItems: 'start' }}>

        <div className="cart-items-list" style={{ background: '#fff', padding: '10px 20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          {itemIds.length === 0 ? (
            <div className="cart-empty-msg" style={{ textAlign: 'center', padding: '60px 20px', display: 'block' }}>
              <div className="empty-icon" style={{ fontSize: '4rem', marginBottom: '15px' }}>🛒</div>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-light)', margin: '0 0 20px 0' }}>Your cart is empty.</p>
              <button className="btn btn-primary" onClick={() => onNavigate('shop')}>Go to Shop</button>
            </div>
          ) : (
            itemIds.map(id => {
              const p = products.find(x => x.id === parseInt(id));
              if (!p) return null;
              const qty = cart[id];
              return (
                <div className="cart-item" key={id} style={{ borderBottom: '1px solid #eee', padding: '20px 0' }}>
                  <div className="cart-item-img"><img src={p.img} alt={p.name} /></div>
                  <div className="cart-item-info">
                    <div className="cart-item-name" style={{ fontSize: '1.1rem', fontWeight: '600' }}>{p.name}</div>
                    <div className="cart-item-price">${(p.price * qty).toFixed(2)}</div>
                  </div>
                  <div className="cart-item-qty">
                    <button className="qty-btn" onClick={() => changeQty(p.id, -1)}>−</button>
                    <span className="qty-num">{qty}</span>
                    <button className="qty-btn" onClick={() => changeQty(p.id, 1)}>+</button>
                  </div>
                  <button className="remove-btn" onClick={() => removeFromCart(p.id)} title="Remove">✕</button>
                </div>
              );
            })
          )}
        </div>

        {itemIds.length > 0 && (
          <div className="cart-footer" style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', position: 'sticky', top: '100px', display: 'block', width: '100%' }}>
            <h4 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Order Summary</h4>
            <div className="cart-subtotal"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
            <div className="cart-subtotal"><span>Shipping</span><span>$3.99</span></div>
            <div className="cart-total" style={{ borderTop: '1px solid #eee', paddingTop: '15px', marginTop: '10px' }}>
              <span>Total</span><strong>${(total + 3.99).toFixed(2)}</strong>
            </div>
            <button className="checkout-btn" style={{ marginTop: '20px' }} onClick={handleCheckout}>Checkout →</button>
            <button className="clear-btn" style={{ marginTop: '10px', width: '100%' }} onClick={clearCart}>Clear Cart</button>
          </div>
        )}

      </div>
    </div>
  );
}
