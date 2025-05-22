<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250521180107 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE bill (id INT AUTO_INCREMENT NOT NULL, client_id INT NOT NULL, garage_id INT NOT NULL, hash VARCHAR(255) NOT NULL, price DOUBLE PRECISION NOT NULL, INDEX IDX_7A2119E319EB6921 (client_id), INDEX IDX_7A2119E3C4FFF555 (garage_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE bill ADD CONSTRAINT FK_7A2119E319EB6921 FOREIGN KEY (client_id) REFERENCES client (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE bill ADD CONSTRAINT FK_7A2119E3C4FFF555 FOREIGN KEY (garage_id) REFERENCES garage (id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE bill DROP FOREIGN KEY FK_7A2119E319EB6921
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE bill DROP FOREIGN KEY FK_7A2119E3C4FFF555
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE bill
        SQL);
    }
}
