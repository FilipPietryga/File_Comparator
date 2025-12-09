package file.comparator.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ComparisonDataDTO {
    private String fileAContent;
    private String fileBContent;
}