using System.Net.Http.Json;
using System.Text.Json;

namespace CvAnalyzer.Infrastructure;

public class AiService
{
    private readonly HttpClient _httpClient;

    public AiService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<object> AnalyzeCv(string text)
    {
        var response = await _httpClient.PostAsJsonAsync(
            "analyze",
            new { cv_text = text }
        );

        var content = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<object>(content) ?? new object();
    }

    public async Task<object> RankCandidates(
        string jobText,
        object candidates)
    {
        var payload = new
        {
            job_text = jobText,
            candidates = candidates
        };

        var response = await _httpClient.PostAsJsonAsync(
            "/rank",
            payload
        );

        var content = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<object>(content) ?? new object();
    }
}
