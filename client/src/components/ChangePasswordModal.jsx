import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  updatePassword,
  clearErrors,
  clearSuccess,
} from "../redux/slices/authSlice";
import DotLottieLoader from "./DotLottieLoader";

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const dispatch = useDispatch();
  const { loading, success, error } = useSelector((state) => state.auth);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    await dispatch(updatePassword({ currentPassword, newPassword }));
  };

  // Reset form on open/close
  useEffect(() => {
    if (isOpen) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [isOpen]);

  // Handle success/error responses
  useEffect(() => {
    if (success.updatePassword) {
      toast.success("Password changed successfully!");
      dispatch(clearSuccess());
      onClose();
    }

    if (error.updatePassword) {
      toast.error(error.updatePassword);
      dispatch(clearErrors());
    }
  }, [success.updatePassword, error.updatePassword, dispatch, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="w-full max-w-md p-6 bg-gray-800/90 border-2 border-cyan-500/30 rounded-2xl shadow-xl z-10 relative">
        {/* Header */}
        <div className="mb-6 text-center relative">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Change Password
          </h2>
          <div className="absolute top-0 -inset-x-4 h-0.5 bg-gradient-to-r from-cyan-500/40 to-purple-500/40"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="currentPassword"
              className="text-sm font-medium text-gray-300 block mb-2"
            >
              Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-600 rounded-lg bg-gray-700/50 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder="Enter current password"
              required
            />
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="text-sm font-medium text-gray-300 block mb-2"
            >
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-600 rounded-lg bg-gray-700/50 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder="Enter new password"
              required
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-gray-300 block mb-2"
            >
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-600 rounded-lg bg-gray-700/50 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder="Confirm new password"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading.updatePassword}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50"
            >
              {loading.updatePassword ? (
                <DotLottieLoader 
                  size="w-4 h-4" 
                  text="Updating..." 
                  layout="horizontal"
                  textSize="text-sm"
                  textColor="text-white"
                />
              ) : (
                "Change Password"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
