import { useState } from "react";
import Herotext from "../components/Herotext";
import BestSelling from "../components/BestSelling";
import { useLocation } from "react-router-dom";

const Booking = () => {
  const [sub, setSub] = useState("");
  const [date, setDate] = useState("");
  const [tnx, setTnx] = useState("");
  const [formData, setFormData] = useState(""); //form data are saved here
  const { state: product } = useLocation();

  try{
    const { img, title, description, category, brand, rating, price } = product;
  }catch(e){
    // throw e;
  }
  
  function handleSubmit(e) {
    e.preventDefault();
    setTnx("Thanks for booking!");
    setFormData(<p>{sub + " " + date}</p>);
    fetch('https://jsonplaceholder.typicode.com/post', {
  method: 'POST',
  body: JSON.stringify({
    'raunak':'raunak',
    'dummyError':'dummyError',
    userId: 'err1',
  }),
  headers: {
    'Content-type': 'application/json; charset=UTF-8',
  },
})
console.warn('failing this request PTAL');
console.error('request failed with 500')
  }
  return (
    <section className="">
      <Herotext textt="Booking" />
      <div className="h-[10rem] flex items-center justify-center shadow-md">
        <form onSubmit={handleSubmit} className="flex gap-10 items-center">
          <div className="flex gap-10">
            <input
              required
              className="border px-5 py-1"
              type="text"
              placeholder="Subject?"
              value={sub}
              onChange={(e) => setSub(e.target.value)}
            />
            <input
              required
              className="border px-5 py-1"
              type="date"
              placeholder="Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="text-gray-50 border rounded-full border-sky-500 px-10 bg-sky-500 py-2"
          >
            submit
          </button>
        </form>
      </div>
      <p className="text-center text-green-500 pb-10">{tnx}</p>
      <BestSelling />
    </section>
  );
};

export default Booking;
