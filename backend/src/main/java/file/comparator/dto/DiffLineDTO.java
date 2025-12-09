package file.comparator.dto;

import file.comparator.enums.Status;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class DiffLineDTO {
    private String lineA;
    private String lineB;
    private Status status;
    private Integer lineNumA;
    private Integer lineNumB;
}