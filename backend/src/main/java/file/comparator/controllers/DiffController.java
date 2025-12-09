package file.comparator.controllers;

import file.comparator.dto.ComparisonDataDTO;
import file.comparator.dto.DiffLineDTO;
import file.comparator.services.DiffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/diff")
@CrossOrigin(origins = "http://localhost:4200")
public class DiffController {

    private final DiffService diffService;

    @Autowired
    public DiffController(DiffService diffService) {
        this.diffService = diffService;
    }

    @PostMapping("/compare")
    public List<DiffLineDTO> compareFiles(@RequestBody ComparisonDataDTO request) {
        String contentA = request.getFileAContent();
        String contentB = request.getFileBContent();
        return diffService.performDiff(contentA, contentB);
    }
}