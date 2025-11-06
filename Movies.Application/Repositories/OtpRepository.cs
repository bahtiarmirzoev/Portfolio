using Dapper;
using Movies.Application.Database;
using Movies.Application.Models;

namespace Movies.Application.Repositories
{
    

    public class OtpRepository : IOtpRepository
    {
        private readonly IDbConnectionFactory _dbConnectionFactory;

        public OtpRepository(IDbConnectionFactory dbConnectionFactory)
        {
            _dbConnectionFactory = dbConnectionFactory;
        }

        public async Task<UserOtp?> GetActiveOtpAsync(Guid userId, string code)
        {
            const string sql = """
                                   SELECT * FROM user_otps 
                                   WHERE userid = @UserId 
                                     AND code = @Code 
                                     AND expiresat > @CurrentTime  -- ✅ ПЕРЕДАЕМ ВРЕМЯ ИЗ C# (UTC)
                                     AND used = false
                                   LIMIT 1;
                               """;

            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            return await connection.QueryFirstOrDefaultAsync<UserOtp>(sql, new 
            { 
                UserId = userId, 
                Code = code,
                CurrentTime = DateTime.UtcNow  // ✅ ПЕРЕДАЕМ UTC ВРЕМЯ
            });
        }

        public async Task<int> GetRecentOtpCountAsync(Guid userId, TimeSpan timeWindow)
        {
            const string sql = """
                                   SELECT COUNT(*) FROM user_otps 
                                   WHERE userid = @UserId 
                                     AND createdat > @Since
                               """;

            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            return await connection.ExecuteScalarAsync<int>(sql, new 
            { 
                UserId = userId, 
                Since = DateTime.UtcNow - timeWindow  // ✅ UTC
            });
        }

        public async Task AddAsync(UserOtp otp)
        {
            const string sql = """
                INSERT INTO user_otps (id, userid, code, expiresat, createdat, used, attempts, lockeduntil)
                VALUES (@Id, @UserId, @Code, @ExpiresAt, @CreatedAt, @Used, @Attempts, @LockedUntil);
            """;

            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            await connection.ExecuteAsync(sql, otp);
        }

        public async Task UpdateAsync(UserOtp otp)
        {
            const string sql = """
                UPDATE user_otps 
                SET attempts = @Attempts, 
                    lockeduntil = @LockedUntil,
                    used = @Used
                WHERE id = @Id;
            """;

            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            await connection.ExecuteAsync(sql, otp);
        }

        public async Task<bool> MarkAsUsedAsync(Guid otpId)
        {
            const string sql = "UPDATE user_otps SET used = true WHERE id = @OtpId";
            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            var result = await connection.ExecuteAsync(sql, new { OtpId = otpId });
            return result > 0;
        }

        public async Task CleanupExpiredOtpsAsync()
        {
            const string sql = "DELETE FROM user_otps WHERE expiresat < @Now";
            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            await connection.ExecuteAsync(sql, new { Now = DateTime.UtcNow.AddMinutes(-10) });
        }
        public async Task<DateTime> GetDatabaseTimeAsync()
        {
            const string sql = "SELECT NOW()";
            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            return await connection.ExecuteScalarAsync<DateTime>(sql);
        }
    }
}