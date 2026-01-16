// Endpoint backend que processa o envio do email.
const CONTACT_ENDPOINT = "https://script.google.com/macros/s/AKfycbyAfOHKymuhci_Ib7d7JIE60OYk77OGvqmwHR6BSZV-sXYFNRLTJYGmV21mscKXiZpM/exec";

// Limites simples para evitar payloads excessivos/spam no front.
const FIELD_LIMITS = {
  from_name: 80,
  subject: 120,
  reply_to: 120,
  message: 2000,
};

document.addEventListener("DOMContentLoaded", () => {
  // ano no footer
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Form handling
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  const submitBtn = document.getElementById("submit-btn");

  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (status) status.textContent = "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando...";
    }

    const emailInput = document.getElementById("email");
    if (emailInput && !validateEmail(emailInput.value)) {
      if (status) status.textContent = "Por favor insira um email válido.";
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Enviar mensagem";
      }
      return;
    }

    // Normaliza e valida tamanho dos campos.
    clampField("name", "from_name");
    clampField("subject", "subject");
    clampField("email", "reply_to");
    clampField("message", "message");

    const payload = buildPayload(form);

    try {
      await sendEmail(payload);
      if (status)
        status.textContent =
          "Mensagem enviada! Obrigado — eu responderei em breve.";
      form.reset();
    } catch (error) {
      console.error("Erro ao enviar:", error);
      if (status)
        status.textContent =
          "Ocorreu um erro ao enviar. Tente novamente mais tarde.";
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Enviar mensagem";
      }
    }
  });

  // smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId.length > 1) {
        e.preventDefault();
        const targetEl = document.querySelector(targetId);
        if (targetEl)
          targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
});

function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

function buildPayload(form) {
  const data = new FormData(form);
  return {
    name: (data.get("from_name") || "").toString().trim(),
    email: (data.get("reply_to") || "").toString().trim(),
    subject: (data.get("subject") || "").toString().trim(),
    message: (data.get("message") || "").toString().trim(),
  };
}

async function sendEmail(payload) {
  if (!CONTACT_ENDPOINT)
    throw new Error("Endpoint de contato não configurado.");

  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    formData.append(key, value);
  });

  const response = await fetch(CONTACT_ENDPOINT, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(body || `Erro HTTP ${response.status}`);
  }

  return response;
}

function clampField(domId, templateKey) {
  const el = document.getElementById(domId);
  if (!el) return;
  const limit = FIELD_LIMITS[templateKey] || 256;
  const trimmed = (el.value || "").trim();
  el.value = trimmed.slice(0, limit);
}
