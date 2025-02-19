'use client'
import { useState, useEffect } from "react";
import axios from "axios";

export default function CurrencyConverter() {
  const [cnyRate, setCnyRate] = useState(null);
  const [usdRate, setUsdRate] = useState(null);
  const [productName, setProductName] = useState("");
  const [priceCNY, setPriceCNY] = useState("");
  const [weight, setWeight] = useState("");
  const [cargoPricePerKg, setCargoPricePerKg] = useState("");
  const [totalUSD, setTotalUSD] = useState(null);
  const [products, setProducts] = useState(() => {
    return JSON.parse(localStorage.getItem("products")) || [];
  });

  useEffect(() => {
    async function fetchExchangeRates() {
      try {
        const response = await axios.get("https://cbu.uz/uz/arkhiv-kursov-valyut/json/");
        const cnyData = response.data.find(item => item.Ccy === "CNY");
        const usdData = response.data.find(item => item.Ccy === "USD");
        
        if (cnyData && usdData) {
          setCnyRate(parseFloat(cnyData.Rate));
          setUsdRate(parseFloat(usdData.Rate));
        }
      } catch (error) {
        console.error("Error fetching exchange rates:", error);
      }
    }
    fetchExchangeRates();
  }, []);

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  const calculateTotal = () => {
    if (!cnyRate || !usdRate || !priceCNY || !weight || !cargoPricePerKg) return;
    
    const priceInUZS = parseFloat(priceCNY) * cnyRate;
    const priceInUSD = priceInUZS / usdRate;
    const cargoCost = (parseFloat(weight) / 1000) * parseFloat(cargoPricePerKg);
    const total = priceInUSD + cargoCost;
    
    setTotalUSD(total);
    setProducts([...products, { productName, priceCNY, weight, cargoPricePerKg, total }]);
    
    // Input maydonlarini tozalash
    setProductName("");
    setPriceCNY("");
    setWeight("");
    setCargoPricePerKg("");
  };

  const deleteProduct = (index) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-bold">Valyuta Konvertatsiya Kalkulyatori</h2>
      <div>
        <label className="block">Mahsulot nomi:</label>
        <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} className="border p-2 w-full" />
      </div>
      <div>
        <label className="block">Mahsulot narxi (CNY):</label>
        <input type="number" value={priceCNY} onChange={(e) => setPriceCNY(e.target.value)} className="border p-2 w-full" />
      </div>
      <div>
        <label className="block">Og'irligi (gramm):</label>
        <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="border p-2 w-full" />
      </div>
      <div>
        <label className="block">Kargo xizmati narxi ($/kg):</label>
        <input type="number" value={cargoPricePerKg} onChange={(e) => setCargoPricePerKg(e.target.value)} className="border p-2 w-full" />
      </div>
      <button onClick={calculateTotal} className="bg-blue-500 text-white p-2 rounded w-full">Hisoblash</button>
      {totalUSD !== null && (
        <div className="text-lg font-semibold">Jami narx (USD): ${totalUSD.toFixed(2)}</div>
      )}
      <h3 className="text-lg font-bold mt-4">Mahsulotlar ro'yxati</h3>
      <table className="w-full border-collapse border border-gray-300 mt-2">
        <thead>
          <tr>
            <th className="border p-2">Mahsulot</th>
            <th className="border p-2">CNY</th>
            <th className="border p-2">Gramm</th>
            <th className="border p-2">Kargo ($/kg)</th>
            <th className="border p-2">Total (USD)</th>
            <th className="border p-2">O'chirish</th>
          </tr>
        </thead>
        <tbody>
          {products.map((item, index) => (
            <tr key={index}>
              <td className="border p-2">{item.productName}</td>
              <td className="border p-2">{item.priceCNY}</td>
              <td className="border p-2">{item.weight}</td>
              <td className="border p-2">{item.cargoPricePerKg}</td>
              <td className="border p-2">${item.total.toFixed(2)}</td>
              <td className="border p-2">
                <button onClick={() => deleteProduct(index)} className="bg-red-500 text-white p-1 rounded">X</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
