import FullFeaturedCrudGrid from "./ui/c_bu/page";
import Header from "./ui/header/header";
import ResponsiveDrawer from "./ui/menu/page";
import NavbarTable from "./ui/menu/page";
import LabelBottomNavigation from "./ui/menu/page";


export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between">
        <ResponsiveDrawer/>
    </main>
  );
}
