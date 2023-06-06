import { useEffect, useState, useCallback } from "react";

const Fetchdata = () => {
  const [products, setProducts] = useState([]);
  const getData = useCallback(async () => {
    if (Boolean(Math.random() < 0.4)) {
      const res = await fetch("https://itproducts.onrender.com/products");
      if (!res.ok) throw new Error("Oops! An error has occured");
      const json = await res.json();

      setProducts(json);
    }
  }, []);
  useEffect(() => {
    getData();
  }, []);

  return products;
};

export default Fetchdata;
