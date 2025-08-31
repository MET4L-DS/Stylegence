"use client";

import {
	IconCreditCard,
	IconDotsVertical,
	IconLogout,
	IconNotification,
	IconUserCircle,
} from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { ProfileModal } from "@/components/ProfileModal";

import { useClerk, useUser } from "@clerk/clerk-react";
import { useState } from "react";

export function NavUser() {
	const { isMobile } = useSidebar();
	const { openUserProfile, signOut } = useClerk();
	const { user: clerkUser } = useUser();
	const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);

	return (
		<>
			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton
								size="lg"
								className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							>
								<Avatar className="h-8 w-8 rounded-lg grayscale">
									<AvatarImage
										src={clerkUser?.imageUrl || ""}
										alt={clerkUser?.fullName || ""}
									/>
									<AvatarFallback className="rounded-lg">
										{clerkUser?.fullName?.charAt(0) || "U"}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">
										{clerkUser?.fullName || "User"}
									</span>
									<span className="text-muted-foreground truncate text-xs">
										{clerkUser?.primaryEmailAddress
											?.emailAddress || "No Email"}
									</span>
								</div>
								<IconDotsVertical className="ml-auto size-4" />
							</SidebarMenuButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
							side={isMobile ? "bottom" : "right"}
							align="end"
							sideOffset={4}
						>
							<DropdownMenuLabel className="p-0 font-normal">
								<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
									<Avatar className="h-8 w-8 rounded-lg">
										<AvatarImage
											src={clerkUser?.imageUrl || ""}
											alt={clerkUser?.fullName || ""}
										/>
										<AvatarFallback className="rounded-lg">
											{clerkUser?.fullName?.charAt(0) ||
												"U"}
										</AvatarFallback>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-medium">
											{clerkUser?.fullName || "User"}
										</span>
										<span className="text-muted-foreground truncate text-xs">
											{clerkUser?.primaryEmailAddress
												?.emailAddress || "No Email"}
										</span>
									</div>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem
									onClick={(e) => {
										e.preventDefault();
										setIsStyleModalOpen(true);
									}}
								>
									<IconUserCircle className="mr-2 h-4 w-4" />
									Profile Settings
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => openUserProfile()}
								>
									<IconUserCircle className="mr-2 h-4 w-4" />
									Account Settings
								</DropdownMenuItem>
								<DropdownMenuItem>
									<IconCreditCard className="mr-2 h-4 w-4" />
									Billing
								</DropdownMenuItem>
								<DropdownMenuItem>
									<IconNotification className="mr-2 h-4 w-4" />
									Notifications
								</DropdownMenuItem>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={() => signOut()}>
								<IconLogout className="mr-2 h-4 w-4" />
								Log out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</SidebarMenuItem>
			</SidebarMenu>

			<ProfileModal
				isOpen={isStyleModalOpen}
				onOpenChange={setIsStyleModalOpen}
			/>
		</>
	);
}
