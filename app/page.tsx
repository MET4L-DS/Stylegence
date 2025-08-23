"use client";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import PaymentButton from "../components/PaymentButton";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Stylegence</h1>
          <div className="flex items-center gap-3">
            <Authenticated>
              <UserButton />
            </Authenticated>
            <Unauthenticated>
              <SignInButton />
            </Unauthenticated>
          </div>
        </header>

        <Authenticated>
          <Dashboard />
        </Authenticated>

        <Unauthenticated>
          <Landing />
        </Unauthenticated>
      </div>
    </main>
  );
}

function Landing() {
  return (
    <div className="text-center py-16">
      <h2 className="text-3xl mb-4 font-semibold">Welcome to Stylegence</h2>
      <p className="text-gray-300 mb-8 max-w-xl mx-auto">
        Discover, curate, and shop the latest fashion trends from multiple platforms — all in one modern, material-inspired experience.
      </p>
      <SignInButton>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-700 transition">
          Get Started
        </button>
      </SignInButton>
    </div>
  );
}

function Dashboard() {
  const user = useQuery(api.users.current);
  const wishlist = useQuery(api.wishlist.getUserWishlist);

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-1">
          <ProfileCard user={user} />
        </div>
        <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatsGrid wishlist={wishlist} />
          <div className="bg-gray-800 rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
            <div className="flex flex-col gap-3">
              <button className="bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition">Create Outfit</button>
              <button className="bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700 transition">Sync Wardrobe</button>
              <PaymentButton amount={10} description="Premium Credits" userInfo={user || { name: "", email: "" }} />
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="bg-gray-800 rounded-lg p-6 shadow-md">
          <h3 className="text-xl font-semibold mb-4">Your Wishlist</h3>
          <WishlistPreview items={wishlist} />
        </div>
      </section>
    </div>
  );
}

function ProfileCard({ user }: { user: any }) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-md flex items-center gap-4">
      <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-2xl font-bold text-white">
        {user?.name ? user.name.charAt(0) : "U"}
      </div>
      <div>
        <h3 className="text-lg font-semibold">{user?.name || "Anonymous"}</h3>
        <p className="text-sm text-gray-300">{user?.email || "No email"}</p>
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
    <div className="bg-gray-800 rounded-lg p-5 shadow-md flex flex-col justify-between">
      <div className="text-sm text-gray-400">{title}</div>
      <div className={`text-3xl font-bold ${accent || "text-white"}`}>{value}</div>
    </div>
  );
}

function StatsGrid({ wishlist }: { wishlist: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <StatCard title="Wishlist Items" value={wishlist?.length || 0} accent="text-blue-400" />
      <StatCard title="Wardrobe Items" value={0} accent="text-green-400" />
      <StatCard title="Outfits Created" value={0} accent="text-purple-400" />
      <StatCard title="Points" value={0} accent="text-yellow-400" />
    </div>
  );
}

function WishlistPreview({ items }: { items: any }) {
  if (!items || items.length === 0) {
    return <div className="text-gray-400">Your wishlist is empty. Add items to get started.</div>;
  }

  return (
    <ul className="space-y-3">
      {items.map((it: any) => (
        <li key={it.wishlistItem._id} className="flex items-center justify-between bg-gray-900 p-3 rounded-md">
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
