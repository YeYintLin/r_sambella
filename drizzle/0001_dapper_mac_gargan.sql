CREATE TABLE `opportunities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`odooId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`stage` varchar(100) NOT NULL,
	`amount` int NOT NULL DEFAULT 0,
	`probability` int NOT NULL DEFAULT 0,
	`expectedRevenue` int NOT NULL DEFAULT 0,
	`partnerName` varchar(255),
	`email` varchar(320),
	`phone` varchar(20),
	`description` text,
	`rating` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`syncedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `opportunities_id` PRIMARY KEY(`id`),
	CONSTRAINT `opportunities_odooId_unique` UNIQUE(`odooId`)
);
