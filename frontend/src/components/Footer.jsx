import { assetss } from "../assets/frontend_assets/assetss";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div>
      {/* anathi small ane moto screen ma display grid hase ane grid ma display hase atle 3:1:1 ratio ma display hase
        //pan small thi pan nana screen ma display flex hase atle responcive thase */}
      <div className="flex flex-col sm:grid  grid-cols-[3fr_1fr_1fr]  gap-14 my-10 text-sm ">
        <div>
          <img src={assetss.logo} className="mb-5 w-32" alt="" />
          <p className="w-full md:w-2/3 h-full text-gray-600">
            Thousands of customers trust us for stylish and comfortable clothing
            that fits their budget. We are committed to offering quality apparel
            that lasts and keeps you looking your best every day.
          </p>
        </div>

        <div>
          <p className="text-xl font-medium mb-5">COMPANY</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <Link to="/" >
              <li>Home</li>
            </Link>
            <Link to="/about" >
              <li>About Us</li>
            </Link>
            <Link to="/contact" >
              <li>Contact us</li>
            </Link>
            <Link to="/privacy-policy" >
              <li>Privacy Policy</li>
            </Link>
          </ul>
        </div>
        <div>
          <p className="text-xl font-medium mb-5">CONTACT</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>+91 1234567890</li>
            <li>contact@thomas.com</li>
          </ul>
        </div>
      </div>
      <div>
        <hr />
        <p className="text-center text-gray-600 mt-5 mb-5">
          Copyright © 2023. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;
