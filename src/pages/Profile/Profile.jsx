import { useState } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { updateProfile } from "../../services/api";
import Sidebar from "../../components/Sidebar/Sidebar";
import "./Profile.css";

const Profile = () => {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    businessName: user?.businessName || "",
    phone: user?.phone || "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await updateProfile(formData);
      if (data.success) {
        login(data.user, localStorage.getItem("token"));
        toast.success("Profile updated");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Profile</h2>
          <p>Manage your account details</p>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-large">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="profile-meta">
          <h3>{user?.name}</h3>
          <p>{user?.email}</p>
        </div>
      </div>

      <div className="profile-form-card">
        <h3>Edit Profile</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Your full name"
            />
          </div>
          <div className="form-group">
            <label>Business Name</label>
            <input
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              placeholder="Your business or brand name"
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="9876543210"
            />
          </div>
          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </>
  );
};

export default Profile;
