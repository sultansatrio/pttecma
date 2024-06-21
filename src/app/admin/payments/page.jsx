"use client";
import React, { useEffect, useState } from "react";
import useAuth from "@/app/hooks/useAuth";
import useProduct from "@/app/hooks/useProduct";
import CardItem from "@/components/CardItem";
import Footer from "@/components/Footer";
import NavbarAdmin from "@/components/NavbarAdmin";
import { db } from "@/firebase/firebase";
import {
  collection,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  doc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

const Product = () => {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [assetNotification, setAssetNotification] = useState(false);
  const [statusChanged, setStatusChanged] = useState(false);

  const { isInCart, removeFromCart, addToCart } = useProduct();

  useEffect(() => {
    if (user && userProfile.role === "user") {
      router.push("/");
    }
  }, [user, userProfile, router]);

  useEffect(() => {
    const unsubProduct = onSnapshot(collection(db, "products"), (snapshot) => {
      let list = [];
      snapshot.docs.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setData(list);
      setFilteredData(list); // Initially set filteredData to all data
    });

    return () => {
      unsubProduct();
    };
  }, []);

  useEffect(() => {
    // Update filteredData whenever searchInput or data changes
    const updatedFilteredData = data.filter(
      (product) =>
        product.category.toLowerCase().includes(searchInput) ||
        product.title.toLowerCase().includes(searchInput)
    );
    setFilteredData(updatedFilteredData);
  }, [data, searchInput]);

  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value.toLowerCase());
  };

  const handleAddToCart = async (product) => {
    addToCart(product);
    try {
      await updateDoc(doc(db, "products", product.id), {
        status: "in cart",
        statusPemesanan: "acc",
      });

      const paymentData = {
        ...product,
        timestamp: serverTimestamp(),
        status: "pending",
        statusPemesanan: "pending",
        inCart: true,
      };
      await updateDoc(doc(db, "payments", product.id), paymentData);

      setStatusChanged(true);
      setAssetNotification(true);
      setTimeout(() => {
        setAssetNotification(false);
      }, 5000);
    } catch (error) {
      console.error("Error updating status in Firestore: ", error);
    }
  };

  const handleRemoveFromCart = async (product) => {
    removeFromCart(product);
    try {
      await updateDoc(doc(db, "products", product.id), {
        status: "available",
        statusPemesanan: "unknown",
      });

      const paymentData = {
        ...product,
        timestamp: serverTimestamp(),
        status: "removed",
        statusPemesanan: "removed",
        inCart: false,
      };
      await updateDoc(doc(db, "payments", product.id), paymentData);

      setStatusChanged(true);
      setAssetNotification(true);
      setTimeout(() => {
        setAssetNotification(false);
      }, 5000);
    } catch (error) {
      console.error("Error updating status in Firestore: ", error);
    }
  };

  const handleAcc = async (product) => {
    try {
      await updateDoc(doc(db, "products", product.id), {
        statusPemesanan: "acc",
      });

      await updateDoc(doc(db, "payments", product.id), {
        statusPemesanan: "acc",
      });

      setData((prevData) =>
        prevData.map((item) =>
          item.id === product.id ? { ...item, statusPemesanan: "acc" } : item
        )
      );

      setAssetNotification(true);
      setTimeout(() => {
        setAssetNotification(false);
      }, 5000);
    } catch (error) {
      console.error("Error updating statusPemesanan in Firestore: ", error);
    }
  };

  return (
    <div>
      <NavbarAdmin />
      <div className="p-8 md:p-24 mt-10">
        <div className="flex justify-between mb-10">
          <h2 className="text-3xl mb-3">All Products</h2>
          {statusChanged && (
            <div className="notification-3xl mb-3">
              Status changed to "available"
            </div>
          )}
          {assetNotification && (
            <div className="notification-3xl mb-3">Happy Hunting</div>
          )}
          <input
            type="text"
            className="input input-bordered"
            value={searchInput}
            onChange={handleSearchInputChange}
            placeholder="Search by category or title"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredData.map((product) => (
            <CardItem
              key={product.id}
              imageUrl={product.image}
              fakultas={product.category}
              judul={product.title}
              deskripsi={product.description}
              harga={product.price}
              status={product.status}
              statusPemesanan={product.statusPemesanan}
              inCart={product.inCart}
              addToCart={() => handleAddToCart(product)}
              removeFromCart={() => handleRemoveFromCart(product)}
              onAcc={() => handleAcc(product)} // Pass handleAcc function
              isInCart={isInCart(product.id)}
              statusChanged={statusChanged}
            />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Product;




