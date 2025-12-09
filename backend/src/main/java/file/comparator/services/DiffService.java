package file.comparator.services;

import file.comparator.dto.DiffLineDTO;
import file.comparator.enums.Status;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class DiffService {

    public List<DiffLineDTO> performDiff(String contentA, String contentB) {
        List<String> linesA = Arrays.asList(contentA.split("\\r?\\n"));
        List<String> linesB = Arrays.asList(contentB.split("\\r?\\n"));

        List<DiffLineDTO> diffs = new ArrayList<>();
        int maxLines = Math.max(linesA.size(), linesB.size());

        for (int i = 0; i < maxLines; i++) {
            String lineA = i < linesA.size() ? linesA.get(i) : "";
            String lineB = i < linesB.size() ? linesB.get(i) : "";

            DiffLineDTO diff = DiffLineDTO.builder()
                .lineA(lineA)
                .lineB(lineB)
                .build();

            if (lineA.equals(lineB) && !lineA.isEmpty()) {
                diff.setStatus(Status.EQUAL);
                diff.setLineNumA(i + 1);
                diff.setLineNumB(i + 1);
            } else if (!lineA.isEmpty() || !lineB.isEmpty()) {
                diff.setStatus(Status.MODIFIED);
                diff.setLineNumA(i < linesA.size() ? i + 1 : null);
                diff.setLineNumB(i < linesB.size() ? i + 1 : null);
            }
            if (diff.getStatus() != null) diffs.add(diff);
        }

        return diffs;
    }
}
