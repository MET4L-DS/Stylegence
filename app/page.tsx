"use client";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import PaymentButton from "../components/PaymentButton";
import HeroSection from "../components/hero-section";
import FooterSection from "@/components/footer";
import ContactSection from "@/components/contact";
import Features3 from "@/components/features-3";
import Features12 from "@/components/features-12";
import IntegrationsSection from "@/components/integrations-4";
import StatsSection from "@/components/stats";
import TeamSection from "@/components/team";
import Testimonials from "@/components/testimonials";


export default function Home() {
  return (
    <>
        <HeroSection/>
        <Features3/>
        <Features12/>
        <IntegrationsSection/>
        <StatsSection/>
        <TeamSection/>
        <Testimonials/>
        <FooterSection/>
    </>
  );
}

function Navbar() {
  return;
}

function Landing() {
  return (
    <section className="mt-12 text-center">
      <h2 className="text-4xl font-extrabold mb-3">Welcome to Stylegence</h2>
      <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
        Discover, curate, and shop the latest fashion trends from multiple platforms — all in one modern, material-inspired experience.
      </p>
      <div className="flex items-center justify-center gap-4">
        <SignInButton>
          <button className="bg-indigo-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-indigo-700 transition">Get Started</button>
        </SignInButton>
        <a className="text-sm text-gray-400 hover:text-white transition">Learn more</a>
      </div>
    </section>
  );
}

function Dashboard() {
  const user = useQuery(api.users.current);
  const wishlist = useQuery(api.wishlist.getUserWishlist);

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ProfileCard user={user} />
          <div className="mt-6">
            <PaymentButton amount={10} description="Premium Credits" userInfo={user || { name: "", email: "" }} />
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 gap-6">
          <div className="bg-gray-850/60 rounded-lg p-6 shadow-sm border border-gray-800">
            <h3 className="text-lg font-medium mb-4">Overview</h3>
            <StatsGrid wishlist={wishlist} />
          </div>

          <div className="bg-gray-850/60 rounded-lg p-6 shadow-sm border border-gray-800">
            <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
            <div className="flex gap-3 flex-wrap">
              <button className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition">Create Outfit</button>
              <button className="bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 transition">Sync Wardrobe</button>
              <button className="bg-gray-800 text-white py-2 px-4 rounded-md border border-gray-700">Import Items</button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-gray-850/60 rounded-lg p-6 shadow-sm border border-gray-800">
            <h3 className="text-xl font-semibold mb-4">Your Wishlist</h3>
            <WishlistPreview items={wishlist} />
          </div>
        </div>

        <aside>
          <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/30 rounded-lg p-5 shadow-md border border-gray-800">
            <h4 className="text-sm text-gray-300">Rewards</h4>
            <div className="mt-3 text-3xl font-bold text-yellow-400">120</div>
            <p className="text-xs text-gray-400 mt-2">Earn points by adding items and writing reviews.</p>
          </div>

          <div className="mt-4 bg-gray-850/60 rounded-lg p-5 shadow-sm border border-gray-800">
            <h4 className="text-sm text-gray-300">Recent Activity</h4>
            <ul className="mt-3 text-sm text-gray-400 space-y-2">
              <li>Added "Sneaker X" to wishlist</li>
              <li>Synced wardrobe from Mall</li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}

function ProfileCard({ user }: { user: any }) {
  return (
    <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/30 rounded-lg p-6 shadow-md border border-gray-800 flex items-center gap-4">
      <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-2xl font-bold text-white shadow-inner">
        {user?.name ? user.name.charAt(0) : "U"}
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold">{user?.name || "Anonymous"}</h3>
        <p className="text-sm text-gray-400">{user?.email || "No email"}</p>
        <div className="mt-3 flex gap-2">
          <button className="text-sm bg-transparent border border-gray-700 px-3 py-1 rounded-md hover:bg-gray-700 transition">Edit Profile</button>
          <button className="text-sm bg-transparent border border-gray-700 px-3 py-1 rounded-md hover:bg-gray-700 transition">Settings</button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, accent }: { title: string; value: string | number; accent?: string }) {
  return (
    <div className="bg-gray-900/40 rounded-lg p-4 shadow-inner border border-gray-800">
      <div className="text-xs text-gray-400">{title}</div>
      <div className={`text-2xl font-bold mt-2 ${accent || "text-white"}`}>{value}</div>
    </div>
  );
}

function StatsGrid({ wishlist }: { wishlist: any }) {
  const count = wishlist?.length || 0;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard title="Wishlist Items" value={count} accent="text-blue-400" />
      <StatCard title="Wardrobe Items" value={0} accent="text-green-400" />
      <StatCard title="Outfits Created" value={0} accent="text-purple-400" />
      <StatCard title="Points" value={120} accent="text-yellow-400" />
    </div>
  );
}

function WishlistPreview({ items }: { items: any }) {
  if (!items) {
    return <div className="text-gray-400">Loading wishlist…</div>;
  }

  if (!items || items.length === 0) {
    return <div className="text-gray-400">Your wishlist is empty. Add items to get started.</div>;
  }

  return (
    <ul className="space-y-3">
      {items.map((it: any) => (
        <li key={it.wishlistItem?._id || Math.random()} className="flex items-center justify-between bg-gray-900 p-3 rounded-md border border-gray-800">
          <div>
            <div className="font-medium">{it.productGroup?.name || "Product"}</div>
            <div className="text-sm text-gray-400">{it.brand?.name || "Brand"}</div>
          </div>
          <div className="text-sm text-gray-300">{it.productVariant?.price ? `₹${it.productVariant.price}` : "Price N/A"}</div>
        </li>
      ))}
    </ul>
  );
}
