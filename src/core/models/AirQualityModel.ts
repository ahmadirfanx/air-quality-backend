import { DataTypes, Model, Sequelize } from 'sequelize';

export class AirQualityModel extends Model {
  declare id: number;
  declare timestamp: Date;
  declare co: number | null;
  declare nmhc: number | null;
  declare benzene: number | null;
  declare nox: number | null;
  declare no2: number | null;
  declare pt08_s1_co: number | null;
  declare pt08_s2_nmhc: number | null;
  declare pt08_s3_nox: number | null;
  declare pt08_s4_no2: number | null;
  declare pt08_s5_o3: number | null;
  declare temperature: number | null;
  declare relative_humidity: number | null;
  declare absolute_humidity: number | null;
}

export const initAirQualityModel = (
  sequelize: Sequelize
): typeof AirQualityModel => {
  AirQualityModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        unique: true,
      },
      co: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      nmhc: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      benzene: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      nox: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      no2: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      pt08_s1_co: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      pt08_s2_nmhc: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      pt08_s3_nox: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      pt08_s4_no2: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      pt08_s5_o3: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      temperature: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      relative_humidity: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      absolute_humidity: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'AirQualityMeasurement',
      tableName: 'air_quality_measurements',
      timestamps: false,
      indexes: [
        {
          fields: ['timestamp'],
        },
        {
          fields: ['timestamp', 'co'],
        },
        {
          fields: ['timestamp', 'benzene'],
        },
        {
          fields: ['timestamp', 'no2'],
        },
      ],
    }
  );

  return AirQualityModel;
};
