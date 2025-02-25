/*
  Warnings:

  - The primary key for the `Question` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `question_id` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `question_text` on the `Question` table. All the data in the column will be lost.
  - The primary key for the `QuestionOption` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `is_correct` on the `QuestionOption` table. All the data in the column will be lost.
  - You are about to drop the column `option_id` on the `QuestionOption` table. All the data in the column will be lost.
  - You are about to drop the column `option_text` on the `QuestionOption` table. All the data in the column will be lost.
  - You are about to drop the column `question_id` on the `QuestionOption` table. All the data in the column will be lost.
  - The primary key for the `Session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `end_time` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `rejoin_allowed` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `session_id` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `start_time` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `test_id` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Session` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `Session` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `Enum(EnumId(0))`.
  - The primary key for the `Test` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `Test` table. All the data in the column will be lost.
  - You are about to drop the column `created_by_id` on the `Test` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Test` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Test` table. All the data in the column will be lost.
  - You are about to drop the column `test_id` on the `Test` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Test` table. All the data in the column will be lost.
  - You are about to drop the column `total_marks` on the `Test` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password_hash` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `User` table. All the data in the column will be lost.
  - The primary key for the `Warning` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `session_id` on the `Warning` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `Warning` table. All the data in the column will be lost.
  - You are about to drop the column `warning_id` on the `Warning` table. All the data in the column will be lost.
  - You are about to drop the column `warning_type` on the `Warning` table. All the data in the column will be lost.
  - You are about to drop the `ActiveSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Log` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TestQuestion` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[Email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionText` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `optionId` to the `QuestionOption` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionId` to the `QuestionOption` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endTime` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `testId` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `CreatedBy` to the `Test` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Description` to the `Test` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Duration` to the `Test` table without a default value. This is not possible if the table is not empty.
  - Added the required column `TestID` to the `Test` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Title` to the `Test` table without a default value. This is not possible if the table is not empty.
  - Added the required column `TotalMarks` to the `Test` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Email` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `FirstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `LastName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Role` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `UserID` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `Warning` table without a default value. This is not possible if the table is not empty.
  - Added the required column `warningType` to the `Warning` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `ActiveSession` DROP FOREIGN KEY `ActiveSession_session_id_fkey`;

-- DropForeignKey
ALTER TABLE `ActiveSession` DROP FOREIGN KEY `ActiveSession_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `Log` DROP FOREIGN KEY `Log_session_id_fkey`;

-- DropForeignKey
ALTER TABLE `Log` DROP FOREIGN KEY `Log_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `QuestionOption` DROP FOREIGN KEY `QuestionOption_question_id_fkey`;

-- DropForeignKey
ALTER TABLE `Session` DROP FOREIGN KEY `Session_test_id_fkey`;

-- DropForeignKey
ALTER TABLE `Session` DROP FOREIGN KEY `Session_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `Test` DROP FOREIGN KEY `Test_created_by_id_fkey`;

-- DropForeignKey
ALTER TABLE `TestQuestion` DROP FOREIGN KEY `TestQuestion_question_id_fkey`;

-- DropForeignKey
ALTER TABLE `TestQuestion` DROP FOREIGN KEY `TestQuestion_test_id_fkey`;

-- DropForeignKey
ALTER TABLE `Warning` DROP FOREIGN KEY `Warning_session_id_fkey`;

-- DropIndex
DROP INDEX `QuestionOption_question_id_fkey` ON `QuestionOption`;

-- DropIndex
DROP INDEX `Session_test_id_fkey` ON `Session`;

-- DropIndex
DROP INDEX `Session_user_id_fkey` ON `Session`;

-- DropIndex
DROP INDEX `Test_created_by_id_fkey` ON `Test`;

-- DropIndex
DROP INDEX `User_email_key` ON `User`;

-- DropIndex
DROP INDEX `Warning_session_id_fkey` ON `Warning`;

-- AlterTable
ALTER TABLE `Question` DROP PRIMARY KEY,
    DROP COLUMN `question_id`,
    DROP COLUMN `question_text`,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `questionText` TEXT NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `QuestionOption` DROP PRIMARY KEY,
    DROP COLUMN `is_correct`,
    DROP COLUMN `option_id`,
    DROP COLUMN `option_text`,
    DROP COLUMN `question_id`,
    ADD COLUMN `optionId` INTEGER NOT NULL,
    ADD COLUMN `questionId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`optionId`, `questionId`);

-- AlterTable
ALTER TABLE `Session` DROP PRIMARY KEY,
    DROP COLUMN `end_time`,
    DROP COLUMN `rejoin_allowed`,
    DROP COLUMN `session_id`,
    DROP COLUMN `start_time`,
    DROP COLUMN `test_id`,
    DROP COLUMN `user_id`,
    ADD COLUMN `endTime` DATETIME(3) NOT NULL,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `rejoinAllowed` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `score` INTEGER NULL,
    ADD COLUMN `startTime` DATETIME(3) NOT NULL,
    ADD COLUMN `testId` INTEGER NOT NULL,
    ADD COLUMN `userId` INTEGER NOT NULL,
    ADD COLUMN `warningCount` INTEGER NOT NULL DEFAULT 0,
    MODIFY `status` ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Test` DROP PRIMARY KEY,
    DROP COLUMN `created_at`,
    DROP COLUMN `created_by_id`,
    DROP COLUMN `description`,
    DROP COLUMN `duration`,
    DROP COLUMN `test_id`,
    DROP COLUMN `title`,
    DROP COLUMN `total_marks`,
    ADD COLUMN `CreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `CreatedBy` INTEGER NOT NULL,
    ADD COLUMN `Description` VARCHAR(191) NOT NULL,
    ADD COLUMN `Duration` INTEGER NOT NULL,
    ADD COLUMN `TestID` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `Title` VARCHAR(191) NOT NULL,
    ADD COLUMN `TotalMarks` INTEGER NOT NULL,
    ADD PRIMARY KEY (`TestID`);

-- AlterTable
ALTER TABLE `User` DROP PRIMARY KEY,
    DROP COLUMN `created_at`,
    DROP COLUMN `email`,
    DROP COLUMN `name`,
    DROP COLUMN `password_hash`,
    DROP COLUMN `role`,
    DROP COLUMN `user_id`,
    ADD COLUMN `ActiveSession` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `Email` VARCHAR(191) NOT NULL,
    ADD COLUMN `FirstName` VARCHAR(191) NOT NULL,
    ADD COLUMN `LastName` VARCHAR(191) NOT NULL,
    ADD COLUMN `Password` VARCHAR(191) NOT NULL,
    ADD COLUMN `Role` VARCHAR(191) NOT NULL,
    ADD COLUMN `UserID` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`UserID`);

-- AlterTable
ALTER TABLE `Warning` DROP PRIMARY KEY,
    DROP COLUMN `session_id`,
    DROP COLUMN `timestamp`,
    DROP COLUMN `warning_id`,
    DROP COLUMN `warning_type`,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `warningType` ENUM('TAB_SWITCH', 'COPY_PASTE', 'RIGHT_CLICK', 'INSPECT_ELEMENT', 'WINDOW_CHANGE') NOT NULL,
    ADD PRIMARY KEY (`id`);

-- DropTable
DROP TABLE `ActiveSession`;

-- DropTable
DROP TABLE `Log`;

-- DropTable
DROP TABLE `TestQuestion`;

-- CreateTable
CREATE TABLE `Option` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `optionText` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TestQuestionRelation` (
    `questionId` INTEGER NOT NULL,
    `testId` INTEGER NOT NULL,

    INDEX `TestQuestionRelation_testId_idx`(`testId`),
    INDEX `TestQuestionRelation_questionId_fkey`(`questionId`),
    PRIMARY KEY (`testId`, `questionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserTest` (
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `testId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,

    INDEX `UserTest_userId_idx`(`userId`),
    PRIMARY KEY (`testId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WarningSessions` (
    `sessionId` INTEGER NOT NULL,
    `warningId` INTEGER NOT NULL,

    INDEX `WarningSessions_warningId_idx`(`warningId`),
    PRIMARY KEY (`sessionId`, `warningId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserQuestionAttempt` (
    `sessionId` INTEGER NOT NULL,
    `questionId` INTEGER NOT NULL,
    `chosenOptionId` INTEGER NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `UserQuestionAttempt_chosenOptionId_idx`(`chosenOptionId`),
    PRIMARY KEY (`sessionId`, `questionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `QuestionOption_questionId_idx` ON `QuestionOption`(`questionId`);

-- CreateIndex
CREATE INDEX `Session_userId_testId_idx` ON `Session`(`userId`, `testId`);

-- CreateIndex
CREATE INDEX `Session_status_idx` ON `Session`(`status`);

-- CreateIndex
CREATE INDEX `Session_testId_fkey` ON `Session`(`testId`);

-- CreateIndex
CREATE UNIQUE INDEX `User_Email_key` ON `User`(`Email`);

-- CreateIndex
CREATE INDEX `Warning_warningType_idx` ON `Warning`(`warningType`);

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `Test`(`TestID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`UserID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Test` ADD CONSTRAINT `Test_CreatedBy_fkey` FOREIGN KEY (`CreatedBy`) REFERENCES `User`(`UserID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuestionOption` ADD CONSTRAINT `QuestionOption_optionId_fkey` FOREIGN KEY (`optionId`) REFERENCES `Option`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuestionOption` ADD CONSTRAINT `QuestionOption_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestQuestionRelation` ADD CONSTRAINT `TestQuestionRelation_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestQuestionRelation` ADD CONSTRAINT `TestQuestionRelation_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `Test`(`TestID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserTest` ADD CONSTRAINT `UserTest_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `Test`(`TestID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserTest` ADD CONSTRAINT `UserTest_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`UserID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WarningSessions` ADD CONSTRAINT `WarningSessions_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `Session`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WarningSessions` ADD CONSTRAINT `WarningSessions_warningId_fkey` FOREIGN KEY (`warningId`) REFERENCES `Warning`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserQuestionAttempt` ADD CONSTRAINT `UserQuestionAttempt_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `Session`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserQuestionAttempt` ADD CONSTRAINT `UserQuestionAttempt_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserQuestionAttempt` ADD CONSTRAINT `UserQuestionAttempt_chosenOptionId_fkey` FOREIGN KEY (`chosenOptionId`) REFERENCES `Option`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
