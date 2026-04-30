using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace LoginSignupAPI.Services
{
    public class CouchDbService
    {
        private readonly HttpClient _httpClient;

        private readonly string baseUrl =
            "http://localhost:5984/usersdb";

        public CouchDbService(HttpClient httpClient)
        {
            _httpClient = httpClient;

            var authToken =
                Convert.ToBase64String(
                    Encoding.ASCII.GetBytes("admin:admin123")
                );

            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Basic", authToken);
        }

        // ================= CREATE USER =================

        public async Task<bool> CreateUserAsync(object user)
        {
            var json = JsonSerializer.Serialize(user);

            var content = new StringContent(
                json,
                Encoding.UTF8,
                "application/json"
            );

            var response =
                await _httpClient.PostAsync(baseUrl, content);

            return response.IsSuccessStatusCode;
        }


        // ================= GET USER BY EMAIL =================

        public async Task<JsonElement?> GetUserByEmailAsync(string email)
        {
            var response =
                await _httpClient.GetAsync(
                    $"{baseUrl}/_all_docs?include_docs=true"
                );

            if (!response.IsSuccessStatusCode)
                return null;

            var json =
                await response.Content.ReadAsStringAsync();

            var document =
                JsonDocument.Parse(json);

            foreach (var row in document.RootElement
                                       .GetProperty("rows")
                                       .EnumerateArray())
            {
                if (!row.TryGetProperty("doc",
                    out JsonElement doc))
                    continue;

                if (!doc.TryGetProperty("Email",
                    out JsonElement emailField))
                    continue;

                if (emailField.GetString() == email)
                    return doc;
            }

            return null;
        }


        // ================= GET PENDING USERS =================

        public async Task<List<JsonElement>> GetPendingUsersAsync()
        {
            var response =
                await _httpClient.GetAsync(
                    $"{baseUrl}/_all_docs?include_docs=true"
                );

            var result =
                new List<JsonElement>();

            if (!response.IsSuccessStatusCode)
                return result;

            var json =
                await response.Content.ReadAsStringAsync();

            var document =
                JsonDocument.Parse(json);

            foreach (var row in document.RootElement
                                       .GetProperty("rows")
                                       .EnumerateArray())
            {
                if (!row.TryGetProperty("doc",
                    out JsonElement doc))
                    continue;

                if (!doc.TryGetProperty("IsApproved",
                    out JsonElement approved))
                    continue;

                if (!approved.GetBoolean())
                    result.Add(doc);
            }

            return result;
        }


        // ================= UPDATE USER (APPROVAL) =================

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
                    $"{baseUrl}/{id}?rev={rev}",
                    content
                );

            return response.IsSuccessStatusCode;
        }


        // ================= GET ALL USERS =================

        public async Task<List<JsonElement>> GetAllUsersAsync()
        {
            var response =
                await _httpClient.GetAsync(
                    $"{baseUrl}/_all_docs?include_docs=true"
                );

            var result =
                new List<JsonElement>();

            if (!response.IsSuccessStatusCode)
                return result;

            var json =
                await response.Content.ReadAsStringAsync();

            var document =
                JsonDocument.Parse(json);

            foreach (var row in document.RootElement
                                       .GetProperty("rows")
                                       .EnumerateArray())
            {
                if (!row.TryGetProperty("doc",
                    out JsonElement doc))
                    continue;

                result.Add(doc);
            }

            return result;
        }
    }
}