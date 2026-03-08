// Local menu item images mapped by item name
import bombaBox from "@/assets/menu/bomba-box.jpg";
import chickenBaga from "@/assets/menu/chicken-baga.jpg";
import crispyWings from "@/assets/menu/crispy-wings.jpg";
import beefMishkaki from "@/assets/menu/beef-mishkaki.jpg";
import fishTikka from "@/assets/menu/fish-tikka.jpg";
import grilledChicken from "@/assets/menu/grilled-chicken.jpg";
import chickenBiryani from "@/assets/menu/chicken-biryani.jpg";
import chickenPilau from "@/assets/menu/chicken-pilau.jpg";
import waliMaharage from "@/assets/menu/wali-maharage.jpg";
import chipsMayai from "@/assets/menu/chips-mayai.jpg";
import vegetableSamosas from "@/assets/menu/vegetable-samosas.jpg";
import kachumbari from "@/assets/menu/kachumbari.jpg";
import freshJuice from "@/assets/menu/fresh-juice.jpg";
import kashata from "@/assets/menu/kashata.jpg";
import tangawizi from "@/assets/menu/tangawizi.jpg";

const imageMap: Record<string, string> = {
  "Bomba Box": bombaBox,
  "Chicken Baga": chickenBaga,
  "Crispy Wings": crispyWings,
  "Beef Mishkaki": beefMishkaki,
  "Fish Tikka": fishTikka,
  "Grilled Chicken Quarter": grilledChicken,
  "Chicken Biryani": chickenBiryani,
  "Chicken Pilau": chickenPilau,
  "Wali Maharage": waliMaharage,
  "Chips Mayai": chipsMayai,
  "Vegetable Samosas": vegetableSamosas,
  "Kachumbari Salad": kachumbari,
  "Fresh Juice": freshJuice,
  "Kashata": kashata,
  "Tangawizi": tangawizi,
};

export function getMenuItemImage(name: string, fallbackUrl?: string | null): string {
  return imageMap[name] || fallbackUrl || "/placeholder.svg";
}

export default imageMap;
