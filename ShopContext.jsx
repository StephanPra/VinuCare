import { createContext, useState } from 'react';
import { products } from './shopData';

export const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [cart, setCart] = useState({});
  const [currentCategory, setCurrentCategory] = useState('all');
  const [isAnimating, setIsAnimating] = useState(false);

  const addToCart = (id) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 400);
  };

  const changeQty = (id, delta) => {
    setCart((prev) => {
      if (!prev[id]) return prev;
      const newQty = prev[id] + delta;
      const updatedCart = { ...prev };
      if (newQty <= 0) {
        delete updatedCart[id];
      } else {
        updatedCart[id] = newQty;
      }
      return updatedCart;
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => {
      const updatedCart = { ...prev };
      delete updatedCart[id];
      return updatedCart;
    });
  };

  const clearCart = () => setCart({});

  const getTotal = () => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const product = products.find((x) => x.id === parseInt(id));
      return product ? sum + product.price * qty : sum;
    }, 0);
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((a, b) => a + b, 0);
  };

  return (
    <ShopContext.Provider value={{
      products, cart, currentCategory, setCurrentCategory,
      addToCart, changeQty, removeFromCart, clearCart, getTotal, getTotalItems,
      isAnimating
    }}>
      {children}
    </ShopContext.Provider>
  );
};
