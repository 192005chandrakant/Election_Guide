/**
 * Generates an ICS file string for an event.
 */
export function generateICS(event: {
  title: string;
  description: string;
  location?: string;
  startDate: Date;
  endDate: Date;
}): string {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const dtstamp = formatDate(new Date());
  const dtstart = formatDate(event.startDate);
  const dtend = formatDate(event.endDate);

  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CivicGuide//Election Calendar//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `DTSTAMP:${dtstamp}`,
    `UID:${dtstamp}-${Math.random().toString(36).substring(2, 9)}@civicguide.org`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}`,
  ];

  if (event.location) {
    icsLines.push(`LOCATION:${event.location}`);
  }

  icsLines.push("END:VEVENT");
  icsLines.push("END:VCALENDAR");

  return icsLines.join("\r\n");
}

/**
 * Triggers a download of an ICS file.
 */
export function downloadICS(filename: string, icsData: string) {
  const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute("download", `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
