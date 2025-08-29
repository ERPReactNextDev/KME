import type { NextApiRequest, NextApiResponse } from "next";
import Mailjet from "node-mailjet";

const client = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY!,
  process.env.MAILJET_API_SECRET!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" });

  const { email, fullname, bookNumber, startDate, endDate, attendance, capacity, purpose } = req.body;

  if (!email || !fullname || !bookNumber) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const request = client.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: { 
            Email: "it.ecoshiftcorp@gmail.com", // must be a verified sender in Mailjet
            Name: "Room Reservation"
          },
          To: [{ Email: "it.ecoshiftcorp@gmail.com", Name: "Admin" }],
          ReplyTo: { Email: email, Name: fullname }, // user email
          Subject: `New Booking Submitted - ${bookNumber}`,
          TextPart: `New booking by ${fullname} (${email}). Booking Number: ${bookNumber}`,
          HTMLPart: `<h3>New Booking Submitted</h3>
            <p><strong>User:</strong> ${fullname} (${email})</p>
            <ul>
              <li><strong>Booking Number:</strong> ${bookNumber}</li>
              <li><strong>Start:</strong> ${startDate}</li>
              <li><strong>End:</strong> ${endDate}</li>
              <li><strong>Attendance:</strong> ${attendance}</li>
              <li><strong>Capacity:</strong> ${capacity}</li>
              <li><strong>Purpose:</strong> ${purpose}</li>
            </ul>
            <p>Thank you.</p>`
        },
      ],
    });

    await request;
    res.status(200).json({ message: "Email sent successfully." });
  } catch (err) {
    console.error("Mailjet error:", err);
    res.status(500).json({ message: "Failed to send email." });
  }
}
