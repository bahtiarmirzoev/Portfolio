using Dapper;
using Movies.Application.Database;
using Movies.Application.Models;
using System;
using System.Threading.Tasks;

namespace Movies.Application.Repositories
{
    public class OtpRepository
    {
        private readonly IDbConnectionFactory _dbConnectionFactory;

        public OtpRepository(IDbConnectionFactory dbConnectionFactory)
        {
            _dbConnectionFactory = dbConnectionFactory;
        }

        public async Task AddOtpAsync(UserOtp otp)
        {
            const string sql = """
                                   INSERT INTO user_otps (id, "userid", code, expiresat, createdat)
                                   VALUES (@Id, @UserId, @Code, @ExpiresAt, @CreatedAt);
                               """;

            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            await connection.ExecuteAsync(sql, otp);
        }


        public async Task<UserOtp?> GetOtpAsync(Guid userId, string code)
        {
            const string sql = """
                                   SELECT * FROM user_otps
                                   WHERE "userid" = @UserId 
                                     AND code = @Code 
                                     AND expiresat > NOW()
                                   LIMIT 1;
                               """;

            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            return await connection.QueryFirstOrDefaultAsync<UserOtp>(sql, new { UserId = userId, Code = code });
        }

    }
}