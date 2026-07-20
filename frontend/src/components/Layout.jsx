import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Layout({ children }) {
  return (
    <div className="App relative">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
