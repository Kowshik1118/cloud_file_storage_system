async function submitSupportTicket(req, res, next) {
  try {
    const { subject, message, priority } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ message: "Subject and message are required" });
    }

    const ticketId = "TICK-" + Math.floor(100000 + Math.random() * 900000);

    res.status(201).json({
      message: "Support ticket submitted successfully!",
      ticket: {
        id: ticketId,
        subject: subject.trim(),
        priority: priority || "Normal",
        status: "Open",
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { submitSupportTicket };
