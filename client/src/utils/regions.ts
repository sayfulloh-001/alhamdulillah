export interface Region {
  name: string;
  districts: string[];
}

export const regionsData: Region[] = [
  {
    name: "Toshkent",
    districts: ["Yunusobod", "Chilonzor", "Mirzo Ulug'bek", "Yakkasaroy", "Sergeli", "Bektemir", "Uchtepa", "Olmazor"]
  },
  {
    name: "Samarqand",
    districts: ["Samarqand sh.", "Pastdarg'om", "Urgut", "Bulung'ur", "Toyloq", "Ishtixon", "Payariq", "Jomboy"]
  },
  {
    name: "Farg'ona",
    districts: ["Farg'ona sh.", "Marg'ilon", "Qo'qon", "Oltiariq", "Quva", "Beshariq", "Rishton", "Yozyovon"]
  },
  {
    name: "Andijon",
    districts: ["Andijon sh.", "Asaka", "Shahrixon", "Izboskan", "Baliqchi", "Oltinko'l", "Xo'jaobod", "Qo'rg'ontepa"]
  },
  {
    name: "Namangan",
    districts: ["Namangan sh.", "Chust", "Pop", "Uchqo'rg'on", "Uychi", "Kosonsoy", "Yangiqo'rg'on", "Norin"]
  },
  {
    name: "Buxoro",
    districts: ["Buxoro sh.", "Gijduvon", "Qorako'l", "Olot", "Shofirkon", "Vobkent", "Kogon", "Jondor"]
  },
  {
    name: "Qashqadaryo",
    districts: ["Qarshi", "Shahrisabz", "Kitob", "Yakkabog'", "G'uzor", "Chiroqchi", "Qamashi", "Kasbi"]
  },
  {
    name: "Surxondaryo",
    districts: ["Termiz", "Denov", "Sherobod", "Sariosiyo", "Boysun", "Jarqo'rg'on", "Sho'rchi", "Qumqo'rg'on"]
  },
  {
    name: "Xorazm",
    districts: ["Urganch", "Xiva", "Gurlan", "Xazorasp", "Shovot", "Qo'shko'pir", "Bog'ot", "Xonqa"]
  },
  {
    name: "Navoiy",
    districts: ["Navoiy sh.", "Karmana", "Qiziltepa", "Xatirchi", "Nurota", "Uchquduq", "Zarafshon", "Konimex"]
  },
  {
    name: "Jizzax",
    districts: ["Jizzax sh.", "Zomin", "G'allaorol", "Sharof Rashidov", "Do'stlik", "Baxmal", "Forish", "Arnasoy"]
  },
  {
    name: "Sirdaryo",
    districts: ["Guliston", "Shirin", "Yangiyer", "Boyovut", "Sardoba", "Sayxunobod", "Oqoltin", "Mirzaobod"]
  },
  {
    name: "Qoraqalpog'iston",
    districts: ["Nukus", "Qo'ng'irot", "To'rtko'l", "Amudaryo", "Beruniy", "Xo'jayli", "Chimboy", "Kegeyli"]
  }
];

export const categoriesData = [
  "Meva",
  "Sabzavot",
  "Poliz",
  "Dukkakli",
  "Don mahsulotlari",
  "Ko'katlar",
  "Quruq meva",
  "Yong'oqlar",
  "Asal",
  "Boshqa"
];
