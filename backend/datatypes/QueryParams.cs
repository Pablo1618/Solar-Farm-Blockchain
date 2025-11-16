namespace Backend.DataTypes;

public record QueryParams(
    string? DeviceName,
    DeviceType? DataType,
    DateTimeOffset? From,
    DateTimeOffset? To,
    string? SortBy,
    int? Limit,
    int? Skip,
    bool Desc = false
);