export const getAdjustedTime = (): string => {
    const serverTime = new Date();
    serverTime.setMinutes(serverTime.getMinutes() + 330);
  
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    };
  
    return new Intl.DateTimeFormat("en-IN", options).format(serverTime);
  };
  
  // export const CurrentTime = (): string => {
  //   const systemTime = new Date();
  
  //   const options: Intl.DateTimeFormatOptions = {
  //     day: "numeric",
  //     month: "numeric",
  //     year: "numeric",
  //     hour: "numeric",
  //     minute: "numeric",
  //     second: "numeric",
  //     hour12: true,
  //   };
  //   return new Intl.DateTimeFormat("en-IN", options).format(systemTime);
  // };
  
  export const CurrentTime = (): string => {
    const today = new Date();
    return today.toISOString().replace("T", " ").slice(0, 19); // "YYYY-MM-DD HH:mm:ss"
  };
  
  export function formatDate(isoDate: any) {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
  
    return `${year}-${month}-${day}`;
  }
  function formatDateWithOffset(offsetSeconds = 0) {
    const date = new Date(Date.now() + offsetSeconds * 1000);
  
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
  
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  
  // Usage: Current time + 30 seconds
  const formattedDate = formatDateWithOffset(30);
  console.log(formattedDate);
  
  
  
  
  export function formatDate_Time(isoDate: any) {
    const date = new Date(isoDate);
  
    // Get date components
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
  
    // Get time components
    let hours = date.getHours();
    let minutes = String(date.getMinutes()).padStart(2, "0");
    let seconds = String(date.getSeconds()).padStart(2, "0");
  
    // Convert hours to 12-hour format and determine AM/PM
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
  
    // Format the time
    const time = `${hours}:${minutes}:${seconds} ${ampm}`;
  
    // Return the final formatted date and time
    return `${day}/${month}/${year}, ${time}`;
  }
  
  export const convertToFormattedDateTime = (input: string): string => {
    const [date, time] = input.split(", ");
    const [day, month, year] = date.split("/");
    const [rawHours, minutes, seconds] = time.split(":");
    const period = time.includes("PM") ? "PM" : "AM";
  
    let hours = parseInt(rawHours, 10);
    if (period === "PM" && hours < 12) {
      hours += 12;
    }
    if (period === "AM" && hours === 12) {
      hours = 0;
    }
  
    const shortYear = year.slice(-2);
  
    return `${day}${month}${shortYear}${String(hours).padStart(
      2,
      "0"
    )}${minutes}`;
  };
  
  export function timeFormat(Time: string) {
    // Split input string into start and end time
    const [startTimeString, endTimeString] = Time.split(" to ");
  
    // Function to convert 24-hour time to 12-hour format
    const formatTo12Hour = (timeString: string) => {
      const [time, modifier] = timeString.trim().split(" "); // Split time and AM/PM
      let [hours, minutes] = time.split(":").map(Number);
  
      // Ensure hours stay within 1-12 for 12-hour format
      if (hours > 12) {
        hours -= 12;
      } else if (hours === 0) {
        hours = 12;
      }
  
      // Return formatted time
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")} ${modifier}`;
    };
  
    // Format start and end times
    const startTime = formatTo12Hour(startTimeString);
    const endTime = formatTo12Hour(endTimeString);
  
    // Return both formatted times as an object
    return { startTime, endTime };
  }
  
  export function generateClassDurationString(
    refClassCount: number,
    refMonthDuration: number
  ): string {
    return `${refClassCount} Class${
      refClassCount > 1 ? "es" : ""
    } in ${refMonthDuration} Month${refMonthDuration > 1 ? "s" : ""} Duration`;
  }
  
  export function generateFileName(): string {
    // Generate a random string of 6 alphabets
    const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@$*";
    const randomChars = Array.from({ length: 6 }, () =>
      alphabets.charAt(Math.floor(Math.random() * alphabets.length))
    ).join("");
  
    // Get current date in DDMMYYYY format
    const today = new Date();
    const datePart = `${String(today.getDate()).padStart(2, '0')}${String(today.getMonth() + 1).padStart(2, '0')}${today.getFullYear()}`;
  
    // Combine random characters with date
    return `${randomChars}${datePart}`;
  }
  
  export  function generatePassword(length: number = 8): string {
    const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowerCase = "abcdefghijklmnopqrstuvwxyz";
    const symbols = "!@#$%^&*()_+{}[]<>?";
    const allChars = upperCase + lowerCase + symbols;
    
    let password = "";
    password += upperCase[Math.floor(Math.random() * upperCase.length)];
    password += lowerCase[Math.floor(Math.random() * lowerCase.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    for (let i = 3; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    return password.split('').sort(() => 0.5 - Math.random()).join('');
}