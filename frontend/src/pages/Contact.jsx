import { assetss } from "../assets/frontend_assets/assetss";
import NewsLetterBox from "../components/NewsLetterBox";
import Title from "../components/Title";

const Contact = () => {
  return (
    <div>
      {/* Title Section */}
      <div className="text-center text-2xl pt-10 border-t">
        <Title text1={"CONTACT"} text2={"US"} />
      </div>

      {/* Main Content */}
      <div className="mt-10 mb-28 flex flex-col md:flex-row gap-10 items-center justify-center px-4">
        <img
          className="w-full md:max-w-[480px]"
          src={assetss.contact_img}
          alt="Contact office image"
        />

        <div className="flex flex-col items-start gap-6 w-full md:w-[480px]">
          <p className="font-semibold text-xl text-gray-600">Our Store</p>
          <p className="text-gray-500">
            57, M D Park Society <br />
            Nana Varachha, Surat, Gujarat 395006
          </p>
          <p className="text-gray-500">
            Tel:{" "}
            <a href="tel:6353007116" className="hover:underline">
              6353007116
            </a>
            <br />
            Email:{" "}
            <a href="mailto:admin@forever.com" className="hover:underline">
              admin@forever.com
            </a>
          </p>

          {/* Google Map */}
          <div className="w-full">
            <iframe
              title="Our Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3720.0707871662624!2d72.89785997494254!3d21.224791180449107!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be0458a06c7e371%3A0xf8c2ca40609b8850!2s57%2C%20M%20D%20Park%20Society%2C%20Nana%20Varachha%2C%20Surat%2C%20Gujarat%20395006!5e0!3m2!1sen!2sin!4v1720597325371!5m2!1sen!2sin"
              width="100%"
              height="300"
              className="rounded-md shadow-sm border"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>

      {/* Newsletter Box */}
      <NewsLetterBox />
    </div>
  );
};

export default Contact;
