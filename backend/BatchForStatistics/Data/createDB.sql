
--Create manually the DB GoStatistics.db
--then import this file:

CREATE TABLE `StatSGFfile` (
    `Id` INTEGER PRIMARY KEY AUTOINCREMENT, 
    `SgfFileName` VARCHAR(255) NOT NULL, 
    `Path` VARCHAR(255) NOT NULL, 
    `VisitsAverage` INTEGER NOT NULL, 
    `TM` VARCHAR(255) NOT NULL, 
    `OT` VARCHAR(255) NOT NULL, 
    `createdAt` DATETIME NOT NULL, 
    `updatedAt` DATETIME NOT NULL
);

CREATE TABLE `StatGame` (
    `Id` INTEGER PRIMARY KEY AUTOINCREMENT, 
    `SGFfileId` INTEGER,
    `Color` VARCHAR(1) NOT NULL, 
    `Level` VARCHAR(5) NOT NULL, 
    `1stChoice` INTEGER NOT NULL, 
    `2ndChoice` INTEGER NOT NULL, 
    `TotalAnalyzedMoves` INTEGER NOT NULL, 
    `UnexpectedMoves` INTEGER NOT NULL, 
    `createdAt` DATETIME NOT NULL, 
    `updatedAt` DATETIME NOT NULL,
	FOREIGN KEY(SGFfileId) REFERENCES SGFfile(Id) ON DELETE CASCADE
);

-- -- To import all data:
-- SELECT * 
-- FROM StatSGFfile sgf
-- LEFT JOIN StatGame game ON game.SGFfileId = sgf.Id