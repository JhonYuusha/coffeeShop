const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');

// In-memory order storage (demo only)
const orders = [];

// Mail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ===============================
// SIMULATE PAYMENT
// ===============================
exports.simulatePayment = async (req, res) => {
  const { method, total, items, email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  const paymentId = `PAY-${uuidv4()}`;

  // Short, human-readable token
  const cancelToken = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  const order = {
    paymentId,
    email,
    items,
    total,
    method,
    status: 'CONFIRMADO',
    cancelToken,
    cancelAttempts: 0,
    createdAt: new Date()
  };

  orders.push(order);

  await transporter.sendMail({
    from: '"Café Expresso ☕" <no-reply@cafeexpresso.com>',
    to: email,
    subject: `☕ Pedido confirmado - ${paymentId}`,
    html: `
<div style="font-family:Poppins,Arial,sans-serif;background:#f4f4f4;padding:30px">
  <div style="max-width:600px;margin:auto;background:#fff;border-radius:12px">
    <div style="background:#3a2618;color:#fff;padding:20px;text-align:center">
      <h2>☕ Café Expresso</h2>
      <p>Pedido confirmado</p>
    </div>

    <div style="padding:30px">
      <p>Olá 👋</p>
      <p>Seu pedido foi recebido e está em preparo.</p>

      <p><b>ID:</b> ${paymentId}</p>
      <p><b>Status:</b> ${order.status}</p>
      <p><b>Total:</b> R$ ${total.toFixed(2)}</p>

      <a
        href="http://localhost:3000/api/payment/order/cancel/${paymentId}"
        style="display:inline-block;margin-top:20px;background:#c0392b;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none"
      >
        ❌ Cancelar pedido
      </a>

      <p style="font-size:12px;margin-top:20px;color:#777">
        O token de cancelamento aparece apenas no site da cafeteria.
      </p>
    </div>
  </div>
</div>
    `
  });

  res.json({
    success: true,
    paymentId,
    cancelToken, // ONLY sent to frontend
    method,
    status: order.status
  });
};

// ===============================
// GET → SHOW CANCEL PAGE
// ===============================
exports.showCancelPage = (req, res) => {
  const { paymentId } = req.params;
  const order = orders.find(o => o.paymentId === paymentId);

  // Order not found
  if (!order) {
    return res.send('<h1>Pedido não encontrado ❌</h1>');
  }

  // Already canceled
  if (order.status === 'CANCELADO') {
    return res.send('<h1>Pedido já cancelado</h1>');
  }

  // Block access after failed attempt
  if (order.cancelAttempts >= 1) {
    return res.send(`
      <script>
        document.body.innerHTML = '';
        alert('Tentativa expirada. Pedido mantido como CONFIRMADO.');
        window.close();
      </script>
    `);
  }

  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Cancelar pedido</title>
  <style>
    body {
      font-family: Poppins, sans-serif;
      background: #f5f5f5;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    .card {
      background: #fff;
      padding: 3rem;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,.1);
      text-align: center;
      width: 420px;
    }
    input {
      width: 100%;
      padding: 12px;
      margin-top: 1rem;
      font-size: 16px;
    }
    button {
      margin-top: 1.5rem;
      padding: 12px;
      width: 100%;
      background: #c0392b;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="card">
    <h2>❌ Cancelar pedido</h2>
    <p>ID: <b>${paymentId}</b></p>

    <form method="POST" action="/api/payment/order/cancel/${paymentId}">
      <input name="token" placeholder="Digite o token do pedido" required />
      <button type="submit">Confirmar cancelamento</button>
    </form>
  </div>
</body>
</html>
  `);
};

// ===============================
// POST → CONFIRM CANCELLATION
// ===============================
exports.confirmCancel = (req, res) => {
  const { paymentId } = req.params;
  const token = req.body?.token;

  const order = orders.find(o => o.paymentId === paymentId);

  if (!order) {
    return res.send('<h1>Pedido não encontrado ❌</h1>');
  }

  if (order.status === 'CANCELADO') {
    return res.send('<h1>Pedido já cancelado</h1>');
  }

  // Token missing
  if (!token) {
    return res.send(`
      <script>
        alert('Token não informado. Fechando a página.');
        window.close();
      </script>
    `);
  }

  // One attempt only
  if (order.cancelAttempts >= 1) {
    return res.send(`
      <script>
        alert('Tentativa expirada. Pedido mantido como CONFIRMADO.');
        window.close();
      </script>
    `);
  }

  // Invalid token
  if (order.cancelToken !== token) {
    order.cancelAttempts += 1;

    return res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Token inválido</title>
  <style>
    body {
      font-family: Poppins, sans-serif;
      background: rgba(0,0,0,.5);
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    .modal {
      background: #fff;
      padding: 2.5rem;
      border-radius: 14px;
      box-shadow: 0 10px 30px rgba(0,0,0,.2);
      text-align: center;
      max-width: 400px;
      animation: fadeIn .3s ease;
    }
    h2 {
      color: #c0392b;
      margin-bottom: 1rem;
    }
    p {
      color: #555;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(.95); }
      to { opacity: 1; transform: scale(1); }
    }
  </style>
</head>
<body>
  <div class="modal">
    <h2>❌ Token incorreto</h2>
    <p>Fechando a página...</p>
  </div>

  <script>
    // Prevent back navigation
    history.pushState(null, '', location.href);
    window.onpopstate = () => history.go(1);

    // Close page after 2 seconds
    setTimeout(() => {
      window.close();
    }, 2000);
  </script>
</body>
</html>
`);
  }

  // Valid token → cancel order
  order.status = 'CANCELADO';

  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Pedido cancelado</title>
  <style>
    body {
      font-family: Poppins, sans-serif;
      background: #f5f5f5;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    .card {
      background: #fff;
      padding: 3rem;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,.1);
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>✅ Pedido cancelado</h1>
    <p>ID: <b>${paymentId}</b></p>
    <p>Você pode fechar esta página.</p>
  </div>
</body>
</html>
  `);
};