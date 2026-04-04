const env = require("../config/env");

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

const parseDomainList = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

const getEmailDomain = (email) => String(email || "").trim().toLowerCase().split("@").pop();

const getDisposableDomains = () => {
  const configuredDomains = parseDomainList(env.DISPOSABLE_EMAIL_DOMAINS);
  return new Set([...DEFAULT_DISPOSABLE_DOMAINS, ...configuredDomains]);
};

const isDisposableEmail = (email) => {
  const domain = getEmailDomain(email);
  if (!domain || !String(email || "").includes("@")) {
    return false;
  }

  for (const blockedDomain of getDisposableDomains()) {
    if (domain === blockedDomain || domain.endsWith(`.${blockedDomain}`)) {
      return true;
    }
  }

  return false;
};

module.exports = {
  DEFAULT_DISPOSABLE_DOMAINS,
  getEmailDomain,
  isDisposableEmail,
};
