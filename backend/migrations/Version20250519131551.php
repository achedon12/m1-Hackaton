<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250519131551 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE brand (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', updated_at DATETIME DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)', PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE driver (id INT AUTO_INCREMENT NOT NULL, client_id INT NOT NULL, vehicle_id INT NOT NULL, driver TINYINT(1) NOT NULL, driver_phone VARCHAR(255) DEFAULT NULL, driver_firstname VARCHAR(255) DEFAULT NULL, driver_lastname VARCHAR(255) DEFAULT NULL, created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', updated_at DATETIME DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)', INDEX IDX_11667CD919EB6921 (client_id), INDEX IDX_11667CD9545317D1 (vehicle_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE meeting (id INT AUTO_INCREMENT NOT NULL, vehicle_id INT NOT NULL, quotation_id INT NOT NULL, meeting_state_id INT NOT NULL, garage_id INT NOT NULL, client_id INT NOT NULL, meeting_date DATETIME NOT NULL, created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', updated_at DATETIME DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)', INDEX IDX_F515E139545317D1 (vehicle_id), INDEX IDX_F515E139B4EA4E60 (quotation_id), INDEX IDX_F515E13996491114 (meeting_state_id), INDEX IDX_F515E139C4FFF555 (garage_id), INDEX IDX_F515E13919EB6921 (client_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE meeting_operation (id INT AUTO_INCREMENT NOT NULL, meeting_id INT NOT NULL, operation_id INT NOT NULL, created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', updated_at DATETIME DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)', INDEX IDX_EFAB111B67433D9C (meeting_id), INDEX IDX_EFAB111B44AC3583 (operation_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE meeting_state (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', updated_at DATETIME DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)', PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE model (id INT AUTO_INCREMENT NOT NULL, brand_id INT NOT NULL, name VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', updated_at DATETIME DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)', INDEX IDX_D79572D944F5D008 (brand_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE quotation (id INT AUTO_INCREMENT NOT NULL, quotation_state_id INT NOT NULL, price DOUBLE PRECISION NOT NULL, tva NUMERIC(4, 2) NOT NULL, created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', updated_at DATETIME DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)', INDEX IDX_474A8DB9F5C78F8F (quotation_state_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE quotation_state (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', updated_at DATETIME DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)', PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE vehicle (id INT AUTO_INCREMENT NOT NULL, brand_id INT NOT NULL, model_id INT NOT NULL, registration_number VARCHAR(255) NOT NULL, circulation_date DATE NOT NULL, vin VARCHAR(255) NOT NULL, kms BIGINT NOT NULL, created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', updated_at DATETIME DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)', INDEX IDX_1B80E48644F5D008 (brand_id), INDEX IDX_1B80E4867975B7E7 (model_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE driver ADD CONSTRAINT FK_11667CD919EB6921 FOREIGN KEY (client_id) REFERENCES client (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE driver ADD CONSTRAINT FK_11667CD9545317D1 FOREIGN KEY (vehicle_id) REFERENCES vehicle (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE meeting ADD CONSTRAINT FK_F515E139545317D1 FOREIGN KEY (vehicle_id) REFERENCES vehicle (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE meeting ADD CONSTRAINT FK_F515E139B4EA4E60 FOREIGN KEY (quotation_id) REFERENCES quotation (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE meeting ADD CONSTRAINT FK_F515E13996491114 FOREIGN KEY (meeting_state_id) REFERENCES meeting_state (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE meeting ADD CONSTRAINT FK_F515E139C4FFF555 FOREIGN KEY (garage_id) REFERENCES garage (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE meeting ADD CONSTRAINT FK_F515E13919EB6921 FOREIGN KEY (client_id) REFERENCES client (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE meeting_operation ADD CONSTRAINT FK_EFAB111B67433D9C FOREIGN KEY (meeting_id) REFERENCES meeting (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE meeting_operation ADD CONSTRAINT FK_EFAB111B44AC3583 FOREIGN KEY (operation_id) REFERENCES operation (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE model ADD CONSTRAINT FK_D79572D944F5D008 FOREIGN KEY (brand_id) REFERENCES brand (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE quotation ADD CONSTRAINT FK_474A8DB9F5C78F8F FOREIGN KEY (quotation_state_id) REFERENCES quotation_state (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE vehicle ADD CONSTRAINT FK_1B80E48644F5D008 FOREIGN KEY (brand_id) REFERENCES brand (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE vehicle ADD CONSTRAINT FK_1B80E4867975B7E7 FOREIGN KEY (model_id) REFERENCES model (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE client ADD vehicle_id INT NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE client ADD CONSTRAINT FK_C7440455545317D1 FOREIGN KEY (vehicle_id) REFERENCES vehicle (id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_C7440455545317D1 ON client (vehicle_id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE client DROP FOREIGN KEY FK_C7440455545317D1
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE driver DROP FOREIGN KEY FK_11667CD919EB6921
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE driver DROP FOREIGN KEY FK_11667CD9545317D1
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE meeting DROP FOREIGN KEY FK_F515E139545317D1
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE meeting DROP FOREIGN KEY FK_F515E139B4EA4E60
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE meeting DROP FOREIGN KEY FK_F515E13996491114
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE meeting DROP FOREIGN KEY FK_F515E139C4FFF555
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE meeting DROP FOREIGN KEY FK_F515E13919EB6921
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE meeting_operation DROP FOREIGN KEY FK_EFAB111B67433D9C
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE meeting_operation DROP FOREIGN KEY FK_EFAB111B44AC3583
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE model DROP FOREIGN KEY FK_D79572D944F5D008
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE quotation DROP FOREIGN KEY FK_474A8DB9F5C78F8F
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE vehicle DROP FOREIGN KEY FK_1B80E48644F5D008
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE vehicle DROP FOREIGN KEY FK_1B80E4867975B7E7
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE brand
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE driver
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE meeting
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE meeting_operation
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE meeting_state
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE model
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE quotation
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE quotation_state
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE vehicle
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_C7440455545317D1 ON client
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE client DROP vehicle_id
        SQL);
    }
}
