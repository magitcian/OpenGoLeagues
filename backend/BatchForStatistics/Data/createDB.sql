
DROP DATABASE IF EXISTS `GoStatistic`;
CREATE DATABASE IF NOT EXISTS `GoStatistic` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `GoStatistic`;

CREATE TABLE `Statistics` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT, 
    `SgfFileName` VARCHAR(255) NOT NULL, 
    `Path` VARCHAR(255) NOT NULL, 
    `VisitsAverage` INTEGER NOT NULL, 
    `BlackLevel` VARCHAR(10) NOT NULL, 
    `Black1stChoice` INTEGER NOT NULL, 
    `Black2ndChoice` INTEGER NOT NULL, 
    `BlackTotalAnalyzedMoves` INTEGER NOT NULL, 
    `BlackUnexpectedMoves` INTEGER NOT NULL, 
    `BlackMatchRateOfMoves1And2` DOUBLE PRECISION NOT NULL, 
    `WhiteLevel` VARCHAR(10) NOT NULL, 
    `White1stChoice` INTEGER NOT NULL, 
    `White2ndChoice` INTEGER NOT NULL, 
    `WhiteTotalAnalyzedMoves` INTEGER NOT NULL, 
    `WhiteUnexpectedMoves` INTEGER NOT NULL, 
    `WhiteMatchRateOfMoves1And2` DOUBLE PRECISION NOT NULL, 
    `createdAt` DATETIME NOT NULL, 
    `updatedAt` DATETIME NOT NULL
);