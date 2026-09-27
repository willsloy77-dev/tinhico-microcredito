/*
 * TINHICO — FORMS
 *
 * Frontend only for now:
 * - validates the minimum necessary fields
 * - checks document type/size without reading file contents
 * - prepares the WhatsApp message locally
 * - does not upload or store documents
 *
 * Backend authorization, document storage and server-side validation
 * will be implemented separately.
 */

(() => {
    "use strict";

    const registrationForm = document.querySelector("#client-registration");
    const quickRequestForm = document.querySelector("#quick-request");

    const WHATSAPP_NUMBER = "258853908255";
    const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024;
    const ALLOWED_DOCUMENT_TYPES = new Set([
        "image/jpeg",
        "image/png",
        "image/webp"
    ]);

    function clean(value) {
        return String(value ?? "").trim();
    }

    function setError(form, fieldId, message) {
        const field = form.querySelector(`#${fieldId}`)?.closest(".form-field");
        const error = form.querySelector(`[data-error-for="${fieldId}"]`);

        if (field) field.classList.toggle("is-invalid", Boolean(message));
        if (error) error.textContent = message || "";
    }

    function clearErrors(form) {
        form.querySelectorAll(".form-field.is-invalid").forEach((field) => {
            field.classList.remove("is-invalid");
        });

        form.querySelectorAll(".form-error").forEach((error) => {
            error.textContent = "";
        });
    }

    function setStatus(element, message, type = "") {
        if (!element) return;

        element.textContent = message;
        element.classList.remove("is-success", "is-error");

        if (type) {
            element.classList.add(`is-${type}`);
        }
    }

    function isValidPhone(phone) {
        const digits = phone.replace(/\D/g, "");
        return digits.length >= 9 && digits.length <= 15;
    }

    function isValidEmail(email) {
        if (!email) return true;

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function validateDocument(file) {
        if (!file) return "";

        if (!ALLOWED_DOCUMENT_TYPES.has(file.type)) {
            return "Use JPG, PNG ou WEBP.";
        }

        if (file.size > MAX_DOCUMENT_SIZE) {
            return "Cada ficheiro deve ter no máximo 5 MB.";
        }

        return "";
    }

    function attachFileLabels() {
        ["bi-front", "bi-back"].forEach((id) => {
            const input = document.querySelector(`#${id}`);
            const output = document.querySelector(`[data-file-name="${id}"]`);

            if (!input || !output) return;

            input.addEventListener("change", () => {
                const file = input.files?.[0];

                if (!file) {
                    output.textContent = "";
                    return;
                }

                const error = validateDocument(file);

                if (error) {
                    output.textContent = error;
                    output.classList.add("is-error");
                    input.value = "";
                    return;
                }

                output.textContent = file.name;
                output.classList.remove("is-error");
            });
        });
    }

    function validateRegistration() {
        clearErrors(registrationForm);

        let valid = true;

        const name = clean(registrationForm.elements.fullName?.value);
        const phone = clean(registrationForm.elements.phone?.value);
        const email = clean(registrationForm.elements.email?.value);

        if (name.length < 3) {
            setError(registrationForm, "client-name", "Informe o nome completo.");
            valid = false;
        }

        if (!isValidPhone(phone)) {
            setError(registrationForm, "client-phone", "Informe um telefone válido.");
            valid = false;
        }

        if (!isValidEmail(email)) {
            setError(registrationForm, "client-email", "Informe um email válido.");
            valid = false;
        }

        const front = registrationForm.elements.biFront?.files?.[0];
        const back = registrationForm.elements.biBack?.files?.[0];

        const frontError = validateDocument(front);
        const backError = validateDocument(back);

        if (frontError) {
            setError(registrationForm, "bi-front", frontError);
            valid = false;
        }

        if (backError) {
            setError(registrationForm, "bi-back", backError);
            valid = false;
        }

        return valid;
    }

    registrationForm?.addEventListener("submit", (event) => {
        event.preventDefault();

        const status = document.querySelector("#registration-status");

        try {
            if (!validateRegistration()) {
                setStatus(
                    status,
                    "Verifique os campos assinalados antes de continuar.",
                    "error"
                );
                return;
            }

            /*
             * Do not upload documents yet.
             * Backend will be connected only after authorization and
             * the final data-security requirements are confirmed.
             */
            setStatus(
                status,
                "Cadastro validado no navegador. O envio para o servidor será ligado na fase de backend.",
                "success"
            );
        } catch (error) {
            console.error("Erro no cadastro:", error);
            setStatus(
                status,
                "Não foi possível validar o cadastro. Tente novamente.",
                "error"
            );
        }
    });

    quickRequestForm?.addEventListener("submit", (event) => {
        event.preventDefault();

        const status = document.querySelector("#quick-request-status");

        try {
            const name = clean(quickRequestForm.elements.requestName?.value);
            const phone = clean(quickRequestForm.elements.requestPhone?.value);
            const amount = Number(quickRequestForm.elements.requestedAmount?.value);

            clearErrors(quickRequestForm);

            if (name.length < 2) {
                setError(quickRequestForm, "request-name", "Informe o seu nome.");
                setStatus(status, "Verifique os campos assinalados.", "error");
                return;
            }

            if (!isValidPhone(phone)) {
                setError(quickRequestForm, "request-phone", "Informe um telefone válido.");
                setStatus(status, "Verifique os campos assinalados.", "error");
                return;
            }

            if (!Number.isFinite(amount) || amount <= 0) {
                setError(quickRequestForm, "request-amount", "Informe um valor válido.");
                setStatus(status, "Verifique os campos assinalados.", "error");
                return;
            }

            const formattedAmount = new Intl.NumberFormat("pt-MZ", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount);

            const message = [
                "Olá, Tinhico Microcrédito.",
                "",
                "Gostaria de solicitar um empréstimo.",
                `Nome: ${name}`,
                `Telefone: ${phone}`,
                `Valor desejado: ${formattedAmount} MZN`
            ].join("\n");

            const url =
                `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

            window.open(url, "_blank", "noopener,noreferrer");
            setStatus(status, "A abrir o WhatsApp...", "success");
        } catch (error) {
            console.error("Erro no pedido via WhatsApp:", error);
            setStatus(
                status,
                "Não foi possível preparar o pedido.",
                "error"
            );
        }
    });

    attachFileLabels();
})();
