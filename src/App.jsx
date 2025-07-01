import React, { useEffect, useState } from 'react'
import './App.css'
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import Homepage from './Pages/HomePage/Homepage';
import { BrowserRouter,Routes,Route } from 'react-router-dom'; 
import Accountpage from './Pages/AccountPage/Accountpage';
import Registerpage from './Pages/AccountPage/Registerpage';
import axios from 'axios';
import ProductDetailPage from './Pages/ProductDetailPage/ProductDetailPage';
import Cart from './component/Cart/Cart';
import useNotification from './component/Customhook/useNotification';
import BestSellerPage from './Pages/BestSellerPage/BestSellerPage';
import Profile from './component/Account/Profile/Profile';
import ForgotPassword from './component/Account/Forget/Forget';
import SearchResults from './Pages/SearchResultPage/SearchResultPage';
import CategoryProductsPage from './Pages/CategoryProductsPage/CategoryProductsPage';
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "https://ecommerce-backend-da9u.onrender.com";
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = "csrftoken";

const App = () => {
  const { notification, hideNotification } = useNotification();
    
  return (
    <>
    
    <BrowserRouter basename="/" >
    
    <Routes>

      <Route path='/' element={<Homepage/>}/>
      <Route path='/login/' element={<Accountpage/>}/>
      <Route path='/register/' element={<Registerpage/>}/>
      <Route path='/cart/' element={<Cart/>}/>
      <Route path="/product/:id/" element={<ProductDetailPage />} />
      <Route path='/bestseller/' element={<BestSellerPage/>}/>
      <Route path='/profile/' element={<Profile/>}/>
      <Route path="/search/" element={<SearchResults />} />
      <Route path="/category/:category_id/products/" element={<CategoryProductsPage />} />
      <Route path="/forgot-password/" element={<ForgotPassword />} />
      <Route path="reset-password/:uidb64/:token/" element={<ForgotPassword />} />

    </Routes>
      
    </BrowserRouter>
    {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}
    </>
  )
}

export default App