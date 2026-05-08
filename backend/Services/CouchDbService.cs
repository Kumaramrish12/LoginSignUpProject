using System.Text;
using System.Text.Json;
using System.Net.Http.Headers;

namespace LoginSignupAPI.Services
{
    public class CouchDbService
    {
        private readonly HttpClient _httpClient;

        private readonly string _dbUrl = "http://localhost:5984/usersdb";
        private readonly string _username = "admin";
        private readonly string _password = "admin123";

        public CouchDbService(HttpClient httpClient)
        {
            _httpClient = httpClient;

            var authToken = Convert.ToBase64String(
                Encoding.ASCII.GetBytes($"{_username}:{_password}")
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

            var response = await _httpClient.PostAsync(_dbUrl, content);

            return response.IsSuccessStatusCode;
        }

        // ================= GET ALL USERS (FIXED + DEBUG) =================
        public async Task<List<JsonElement>> GetAllUsersAsync()
        {
            var response = await _httpClient.GetAsync(
                $"{_dbUrl}/_all_docs?include_docs=true"
            );

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"CouchDB error: {response.StatusCode}");
            }

            var content = await response.Content.ReadAsStringAsync();

            Console.WriteLine("🔥 RAW COUCH RESPONSE:");
            Console.WriteLine(content);

            var json = JsonDocument.Parse(content);

            var rows = json.RootElement.GetProperty("rows");

            var users = new List<JsonElement>();

            foreach (var row in rows.EnumerateArray())
            {
                if (row.TryGetProperty("doc", out var doc))
                {
                    Console.WriteLine("👉 DOC FOUND:");
                    Console.WriteLine(doc.ToString());

                    // skip design docs
                    if (doc.TryGetProperty("_id", out var idProp))
                    {
                        var id = idProp.GetString();

                        if (!string.IsNullOrEmpty(id) &&
    !id.StartsWith("_design"))
                        {
                            users.Add(doc);
                        }
                    }
                }
                else
                {
                    Console.WriteLine("❌ NO DOC FOUND IN ROW");
                }
            }

            Console.WriteLine($"✅ TOTAL USERS FOUND: {users.Count}");

            return users;
        }

        // ================= GET ALL USER EMAILS =================
        public async Task<List<string>> GetAllUserEmailsAsync()
        {
            var users = await GetAllUsersAsync();

            var emails = new List<string>();

            foreach (var user in users)
            {
                if (user.TryGetProperty("Email", out var e1))
                {
                    emails.Add(
    e1.GetString() ?? ""
);
                }
                else if (user.TryGetProperty("email", out var e2))
                {
                    emails.Add(
    e2.GetString() ?? ""
);
                }
                else
                {
                    Console.WriteLine("❌ EMAIL FIELD NOT FOUND IN USER:");
                    Console.WriteLine(user.ToString());
                }
            }

            Console.WriteLine("📧 EMAIL LIST:");
            foreach (var email in emails)
            {
                Console.WriteLine(email);
            }

            return emails;
        }

        // ================= GET USER BY EMAIL =================
        public async Task<JsonElement?> GetUserByEmailAsync(string email)
        {
            var users = await GetAllUsersAsync();

            foreach (var user in users)
            {
                if (
                    user.TryGetProperty("Email", out var e1) &&
                    e1.GetString()?.ToLower() == email.ToLower()
                )
                {
                    return user;
                }

                if (
                    user.TryGetProperty("email", out var e2) &&
                    e2.GetString()?.ToLower() == email.ToLower()
                )
                {
                    return user;
                }
            }

            return null;
        }

        // ================= UPDATE USER =================
        public async Task<bool> UpdateUserAsync(string id, string rev, object updatedUser)
        {
            var json = JsonSerializer.Serialize(updatedUser);

            var content = new StringContent(
                json,
                Encoding.UTF8,
                "application/json"
            );

            var response = await _httpClient.PutAsync(
                $"{_dbUrl}/{id}?rev={rev}",
                content
            );

            return response.IsSuccessStatusCode;
        }

        // ================= DELETE USER =================
        public async Task<bool> DeleteUserAsync(string id, string rev)
        {
            var response = await _httpClient.DeleteAsync(
                $"{_dbUrl}/{id}?rev={rev}"
            );

            return response.IsSuccessStatusCode;
        }
        // ================= UPDATE ACTIVE SESSION =================
public async Task<bool> UpdateActiveSessionAsync(
    string email,
    string sessionId
)
{
    var user = await GetUserByEmailAsync(email);

    if (user == null)
        return false;

    var userDoc = user.Value;

    // get _id
string id =
    userDoc.GetProperty("_id")
    .GetString() ?? "";

    // get _rev
   string rev =
    userDoc.GetProperty("_rev")
    .GetString() ?? "";

    // convert user to dictionary
    var updatedUser =
        JsonSerializer.Deserialize
        <Dictionary<string, object>>(
            userDoc.ToString()
        );

    // update session
    if (updatedUser == null)
    return false;
    updatedUser["ActiveSessionId"] =
        sessionId;

    var json =
        JsonSerializer.Serialize(updatedUser);

    var content = new StringContent(
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
    }

    
}