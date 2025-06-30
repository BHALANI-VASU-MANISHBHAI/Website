import OtpInput from 'react-otp-input';

export default function OtpEnter({ otp, setOtp }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <h2 className="text-lg font-semibold">Enter OTP</h2>
      <OtpInput
        value={otp}
        onChange={setOtp}
        numInputs={4}
        renderSeparator={<span>-</span>}
        renderInput={(props) => <input {...props} className="border p-2 w-10 text-center" />}
      />
    </div>
  );
}
