CREATE TABLE `admins` (
  `admin_id` integer PRIMARY KEY,
  `email` varchar(255),
  `password` varchar(255),
  `role` varchar(255)
)

CREATE TABLE `users` (
  `user_id` integer PRIMARY KEY,
  `email` varchar(255),
  `phone` varchar(255),
  `password` varchar(255),
  `status` enum('LOCKED', 'DEFAULT')
);

CREATE TABLE `books` (
  `book_id` integer PRIMARY KEY,
  `title` varchar(255),
  `author` varchar(255),
  `year` varchar(255),
  `publisher` varchar(255),
  `image_url` varchar(255),
  `category` varchar(255),
  `description` TEXT,
  `count` integer
);

CREATE TABLE `requests` (
  `request_id` integer PRIMARY KEY,
  `user_id` integer,
  `book_id` integer,
  `request_date` timestamp,
  `start_date` timestamp,
  `due_date` timestamp,
  `actual_return_date` timestamp,
  `status` enum('Request', 'Borrowed', 'Returned', 'Overdue'),
  `penaty_fee` integer
);

CREATE TABLE `ratings` (
  `rating_id` integer PRIMARY KEY,
  `user_id` integer,
  `book_id` integer,
  `rating` varchar(255)
);

CREATE TABLE `notifications` (
  `notification_id` integer PRIMARY KEY,
  `user_id` integer,
  `subject` varchar(255),
  `message` TEXT
);

CREATE TABLE `comments` (
  `comment_id` integer PRIMARY KEY,
  `book_id` integer,
  `user_id` integer,
  `replied_user_id` interger,
  `lever` integer,
  `message` varchar(255),
  `create_at` timestamp
);

CREATE TABLE `recents` (
  `recent_id` integer PRIMARY KEY,
  `user_id` integer,
  `book_id` integer,
  `create_at` timestamp
);

ALTER TABLE `ratings` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

ALTER TABLE `ratings` ADD FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`);

ALTER TABLE `recents` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

ALTER TABLE `recents` ADD FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`);

ALTER TABLE `notifications` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

ALTER TABLE `requests` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

ALTER TABLE `requests` ADD FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`);

ALTER TABLE `comments` ADD FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`);

ALTER TABLE `comments` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

ALTER TABLE `comments` ADD FOREIGN KEY (`replied_user_id`) REFERENCES `users` (`user_id`);
