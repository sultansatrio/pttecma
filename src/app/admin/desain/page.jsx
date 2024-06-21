"use client";
import useAuth from "@/app/hooks/useAuth";
import useProduct from "@/app/hooks/useProduct";
import CardItem2 from "@/components/CardItem2";
import Footer from "@/components/Footer";
import NavbarAdmin from "@/components/NavbarAdmin";
import { db } from "@/firebase/firebase";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const Desain = () => {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [data, setData] = useState([]);
  const [newAssetNotification, setNewAssetNotification] = useState(false);
  const [AssetNotification, setAssetNotification] = useState(false);
  const { isInCart, removeFromCart, addToCart } = useProduct();

  useEffect(() => {
    if (user && userProfile.role === "user") {
      router.push("/");
    }
  }, [user, userProfile, router]);

  useEffect(() => {
    const unsubProduct = onSnapshot(
      collection(db, "desain"),
      (snapshot) => {
        let list = [];
        snapshot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });

        const isNewAssetAdded = list.length === data.length;
        if (isNewAssetAdded) {
          setNewAssetNotification(true);
          setAssetNotification(false);
        } else {
          setNewAssetNotification(false);
          setAssetNotification(true);
        }

        setData(list);
      },
      (error) => {
        console.log(error);
      }
    );
    return () => {
      unsubProduct();
    };
  }, [data]);

  const handleSendToGudang = async (product) => {
    try {
      await addDoc(collection(db, "payments"), product);
      alert("Data sent to Gudang successfully!");
    } catch (error) {
      console.error("Error sending data to Gudang:", error);
    }
  };

  const filteredData =
    data && categoryFilter === "all"
      ? data
      : data.filter(
          (product) => product.category.toLowerCase() === categoryFilter
        );

  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value.toLowerCase());
  };

  useEffect(() => {
    const selectElement = document.querySelector(".select");
    selectElement.childNodes.forEach((option) => {
      if (option.value.toLowerCase().includes(searchInput)) {
        option.selected = true;
      }
    });
    setCategoryFilter(searchInput);
  }, [searchInput]);

  useEffect(() => {
    const notificationTimeout = setTimeout(() => {
      setNewAssetNotification(false);
    }, 5000);
    return () => clearTimeout(notificationTimeout);
  }, [newAssetNotification]);

  useEffect(() => {
    const notificationTimeout = setTimeout(() => {
      setAssetNotification(false);
    }, 5000);
    return () => clearTimeout(notificationTimeout);
  }, [AssetNotification]);

  return (
    <div>
      <NavbarAdmin />
      <div className="p-8 md:p-24 mt-10">
        <div className="flex justify-between mb-10">
          <h2 className="text-3xl mb-3">All Products</h2>
          {AssetNotification && (
            <div className="notification-3xl mb-3">Happy Hunting</div>
          )}
          <input
            type="text"
            className="input input-bordered"
            value={searchInput}
            onChange={handleSearchInputChange}
          />
          <select
            className="select select-bordered w-full max-w-xs"
            onChange={(e) => setCategoryFilter(e.target.value.toLowerCase())}
          >
            <option value={"all"}>All</option>
            <option value={"fikom"}>Fikom</option>
            <option value={"dkv"}>DKV</option>
            <option value={"fasilkom"}>Fasilkom</option>
            <option value={"baleho 1"}>Baleho</option>
            <option value={"baleho 2"}>Baleho</option>
            <option value={"baleho 3"}>Baleho</option>
            <option value={"baleho 4"}>Baleho</option>
            <option value={"baleho 5"}>Baleho</option>
            <option value={"baleho 6"}>Baleho</option>
            <option value={"baleho 7"}>Baleho</option>
            <option value={"baleho 8"}>Baleho</option>
            <option value={"baleho 9"}>Baleho</option>
            <option value={"baleho 10"}>Baleho</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 place-items-center gap-6">
          {filteredData.map((product) => (
            <CardItem2
              key={product.id}
              imageUrl={product.image}
              fakultas={product.category}
              judul={product.title}
              deskripsi={product.description}
              harga={product.price}
              handleSendToGudang={() => handleSendToGudang(product)}
            />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Desain;
