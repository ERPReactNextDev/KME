import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

// Direct Mailjet API credentials
const apiKey = "64050af048967cba97a417f8307682ff";
const apiSecret = "7116d29184031204f7d0c6566ff00429";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  const {
    email,
    fullname,
    bookNumber,
    startDate,
    endDate,
    attendance,
    capacity,
    purpose,
    location,
  } = req.body;

  if (!email || !fullname || !bookNumber) {
    return res.status(400).json({ success: false, message: "Missing required fields." });
  }

  const subject = `New Booking Submitted - ${bookNumber}`;
  const htmlContent = `
    <h3>New Booking Submitted</h3>
    <p><strong>User:</strong> ${fullname} (${email})</p>
    <ul>
      <li><strong>Booking Number:</strong> ${bookNumber}</li>
      <li><strong>Start:</strong> ${startDate}</li>
      <li><strong>End:</strong> ${endDate}</li>
      <li><strong>Attendance:</strong> ${attendance}</li>
      <li><strong>Capacity:</strong> ${capacity}</li>
      <li><strong>Purpose:</strong> ${purpose}</li>
      <li><strong>Location:</strong> ${location}</li>
    </ul>
    <p>Thank you.</p>
  `;

  const body = {
    Messages: [
      {
        From: {
          Email: "it.ecoshiftcorp@gmail.com",
          Name: "Room Reservation",
        },
        To: [
          {
            Email: "it.ecoshiftcorp@gmail.com",
            Name: "Admin",
          },
        ],
        ReplyTo: {
          Email: email,
          Name: fullname,
        },
        Subject: subject,
        HTMLPart: htmlContent,
      },
    ],
  };

  try {
    const response = await axios.post("https://api.mailjet.com/v3.1/send", body, {
      auth: {
        username: apiKey,
        password: apiSecret,
      },
    });

    console.log("Mailjet response:", response.data);

    const status = response.data?.Messages?.[0]?.Status;
    if (status === "success") {
      return res.status(200).json({ success: true, message: "Email sent successfully!" });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: "Mailjet failed to send email.", 
        data: response.data 
      });
    }
  } catch (error: any) {
    console.error("Mailjet error:", error.response?.data || error.message || error);
    return res.status(500).json({ success: false, message: "Failed to send email.", error: error.response?.data || error.message });
  }
}
