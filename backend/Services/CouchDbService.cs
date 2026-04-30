using System.Text;
using System.Text.Json;
using System.Net.Http.Headers;

namespace LoginSignupAPI.Services
{
    public class CouchDbService
    {
        private readonly HttpClient _httpClient;

        // CHANGE THESE IF DIFFERENT
        private readonly string _dbUrl =
            "http://localhost:5984/usersdb";

        private readonly string _username = "admin";
        private readonly string _password = "admin123";

        public CouchDbService(HttpClient httpClient)
        {
            _httpClient = httpClient;

            var authToken =
                Convert.ToBase64String(
                    Encoding.ASCII.GetBytes(
                        $"{_username}:{_password}"
                    )
                );

            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Basic", authToken);
        }


        // ================= CREATE USER =================

        public async Task<bool> CreateUserAsync(object user)
        {
            var json =
                JsonSerializer.Serialize(user);

            var content =
                new StringContent(
                    json,
                    Encoding.UTF8,
                    "application/json"
                );

            var response =
                await _httpClient.PostAsync(_dbUrl, content);

            return response.IsSuccessStatusCode;
        }


        // ================= GET USER BY EMAIL =================

        public async Task<JsonElement?> GetUserByEmailAsync(string email)
        {
            var users = await GetAllUsersAsync();

            foreach (var user in users)
            {
                if (
                    user.GetProperty("Email")
                        .GetString()
                        ?.ToLower()
                    ==
                    email.ToLower()
                )
                {
                    return user;
                }
            }

            return null;
        }


        // ================= GET ALL USERS =================

        public async Task<List<JsonElement>> GetAllUsersAsync()
        {
            var response =
                await _httpClient.GetAsync(
                    $"{_dbUrl}/_all_docs?include_docs=true"
                );

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception(
                    $"CouchDB error: {response.StatusCode}"
                );
            }

            var content =
                await response.Content.ReadAsStringAsync();

            var json =
                JsonDocument.Parse(content);

            var rows =
                json.RootElement.GetProperty("rows");

            return rows
                .EnumerateArray()
                .Select(r => r.GetProperty("doc"))
                .ToList();
        }


        // ================= UPDATE USER =================

        public async Task<bool> UpdateUserAsync(
            string id,
            string rev,
            object updatedUser
        )
        {
            var json =
                JsonSerializer.Serialize(updatedUser);

            var content =
                new StringContent(
                    json,
                    Encoding.UTF8,
                    "application/json"
                );

            var response =
                await _httpClient.PutAsync(
                    $"{_dbUrl}/{id}?rev={rev}",
                    content
                );

            return response.IsSuccessStatusCode;
        }


        // ================= DELETE USER =================

        public async Task<bool> DeleteUserAsync(
            string id,
            string rev
        )
        {
            var response =
                await _httpClient.DeleteAsync(
                    $"{_dbUrl}/{id}?rev={rev}"
                );

            return response.IsSuccessStatusCode;
        }
    }
}