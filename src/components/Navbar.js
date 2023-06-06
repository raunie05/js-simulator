import { Link, NavLink } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { GenerateDiffErrors } from "./ErrorGeneration";
const Navbar = () => {
  return (
    <div className="shadow-lg backdrop-blur-lg py-5 text-gray-900 bg-gray-50">
      <nav className="flex items-center container mx-auto">
        <div>
          <Link to="/" className="text-gray-700 italic text-7xl">
            ITS
          </Link>
        </div>
        <ul className="list-none flex justify-center items-center ml-auto gap-5">
          <li>
            <NavLink to="/">Home</NavLink>
          </li>
          <li>
            <NavLink to="/about"onClick={()=>{throw new Error('redirecting issues at about')}}>About</NavLink>
          </li>
          <li>
            <NavLink to="/product"onClick={()=>{throw new Error('redirecting issues for product')}}>Product</NavLink>
          </li>
          <li>
            <NavLink to="/booking"onClick={()=>{throw new Error('redirecting issues at booking')}}>Booking</NavLink>
          </li>
          <li>
            <NavLink to="/contact"onClick={()=>{throw new Error('redirecting issues at contact')}} >Contact</NavLink>
          </li>
          <li>
            <NavLink to="/*" >404 2</NavLink>
          </li>
          <li>
            <NavLink to="/cart">
            <GenerateDiffErrors/>
              <FaShoppingCart />
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;
