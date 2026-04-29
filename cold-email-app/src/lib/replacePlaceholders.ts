type Contact = {
  email: string;
  name: string | null;
  company: string | null;
  job_title: string | null;
};

export function replacePlaceholders(text: string, contact: Contact) {
  return text
    .replaceAll("{email}", contact.email ?? "")
    .replaceAll("{name}", contact.name ?? "")
    .replaceAll("{company}", contact.company ?? "")
    .replaceAll("{job_title}", contact.job_title ?? "");
}