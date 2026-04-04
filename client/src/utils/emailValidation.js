const DEFAULT_DISPOSABLE_DOMAINS = [
  "10minutemail.com",
  "10minutemail.net",
  "10minutemail.org",
  "10minutemail.co.uk",
  "33mail.com",
  "burnermail.io",
  "dispostable.com",
  "emailondeck.com",
  "fakeinbox.com",
  "getairmail.com",
  "getnada.com",
  "guerrillamail.biz",
  "guerrillamail.com",
  "guerrillamail.de",
  "guerrillamail.info",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamailblock.com",
  "inboxbear.com",
  "inboxkitten.com",
  "maildrop.cc",
  "mailinator.com",
  "mailnesia.com",
  "mintemail.com",
  "moakt.com",
  "mohmal.com",
  "owlymail.com",
  "sharklasers.com",
  "spam4.me",
  "spamgourmet.com",
  "spambox.org",
  "temp-mail.app",
  "temp-mail.io",
  "temp-mail.org",
  "tempmail.com",
  "tempmail.dev",
  "tempmail.email",
  "tempmail.net",
  "throwawaymail.com",
  "trashmail.com",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
];

const getEmailDomain = (email) => String(email || "").trim().toLowerCase().split("@").pop();

const isDisposableEmail = (email) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const domain = getEmailDomain(normalizedEmail);

  if (!normalizedEmail.includes("@") || !domain) {
    return false;
  }

  return DEFAULT_DISPOSABLE_DOMAINS.some(
    (blockedDomain) => domain === blockedDomain || domain.endsWith(`.${blockedDomain}`),
  );
};

export { DEFAULT_DISPOSABLE_DOMAINS, getEmailDomain, isDisposableEmail };
